"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  evaluateScreening,
  type ScreeningAnswerMap,
} from "@/lib/screening-questions";

export type NewProjectInput = {
  name: string;
  manufacturer: string;
  contactName?: string;
  contactEmail?: string;
  productType?: string;
  productDescription?: string;
};

export async function createProject(input: NewProjectInput) {
  const project = await prisma.project.create({
    data: {
      name: input.name.trim(),
      manufacturer: input.manufacturer.trim(),
      contactName: input.contactName?.trim() || null,
      contactEmail: input.contactEmail?.trim() || null,
      productType: input.productType?.trim() || null,
      productDescription: input.productDescription?.trim() || null,
    },
  });
  revalidatePath("/");
  redirect(`/projects/${project.id}/screening`);
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
}

export type NewAssetInput = {
  projectId: string;
  kind: string;
  name: string;
  description?: string;
  metadata?: Record<string, string>;
};

export async function createAsset(input: NewAssetInput) {
  await prisma.asset.create({
    data: {
      projectId: input.projectId,
      kind: input.kind,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      metadata: JSON.stringify(input.metadata ?? {}),
    },
  });
  revalidatePath(`/projects/${input.projectId}/assets`);
  revalidatePath("/");
}

export async function deleteAsset(id: string, projectId: string) {
  await prisma.asset.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}/assets`);
  revalidatePath(`/projects/${projectId}/assets/review`);
  revalidatePath("/");
}

export type UpdateAssetInput = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  metadata?: Record<string, string>;
};

export async function updateAsset(input: UpdateAssetInput) {
  await prisma.asset.update({
    where: { id: input.id },
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      metadata: JSON.stringify(input.metadata ?? {}),
    },
  });
  revalidatePath(`/projects/${input.projectId}/assets`);
  revalidatePath(`/projects/${input.projectId}/assets/review`);
}

// Save a single DT node answer. Upserts manually because SQLite treats NULLs
// as distinct in unique indexes (would prevent upsert for global requirements).
export async function saveDTNodeAnswer(input: {
  projectId: string;
  assetId: string | null;
  mechanismCode: string;
  requirementId: string;
  nodeId: string;
  answer: "yes" | "no";
  notes?: string;
}) {
  const existing = await prisma.dTAnswer.findFirst({
    where: {
      projectId: input.projectId,
      assetId: input.assetId,
      requirementId: input.requirementId,
      nodeId: input.nodeId,
    },
  });
  if (existing) {
    await prisma.dTAnswer.update({
      where: { id: existing.id },
      data: {
        answer: input.answer,
        notes: input.notes?.trim() || null,
      },
    });
  } else {
    await prisma.dTAnswer.create({
      data: {
        projectId: input.projectId,
        assetId: input.assetId,
        mechanismCode: input.mechanismCode,
        requirementId: input.requirementId,
        nodeId: input.nodeId,
        answer: input.answer,
        notes: input.notes?.trim() || null,
      },
    });
  }
  revalidatePath(`/projects/${input.projectId}/dt`);
  revalidatePath(`/projects/${input.projectId}/dt/${input.requirementId}`);
  revalidatePath("/");
}

// When the user changes an earlier answer, we must discard subsequent answers
// because the new path may diverge. This deletes `nodeId` and all answers
// recorded after it for the same (asset, requirement).
export async function revertDTNodeAndAfter(input: {
  projectId: string;
  assetId: string | null;
  requirementId: string;
  fromNodeId: string; // inclusive — remove this node and anything after
  afterNodeIds: string[]; // node ids in the prior path that come AFTER fromNodeId
}) {
  const ids = [input.fromNodeId, ...input.afterNodeIds];
  await prisma.dTAnswer.deleteMany({
    where: {
      projectId: input.projectId,
      assetId: input.assetId,
      requirementId: input.requirementId,
      nodeId: { in: ids },
    },
  });
  revalidatePath(`/projects/${input.projectId}/dt`);
  revalidatePath(`/projects/${input.projectId}/dt/${input.requirementId}`);
}

// Copy answers from one requirement to another (the UI exposes this for
// requirements whose DT node structure is identical — see `sameAs`).
// Assets that do not match the target requirement's iteration scope are skipped,
// so e.g. a Part-1 `network_asset` answer is not copied to a Part-2 requirement
// that only iterates `privacy_asset`.
export async function copyDTAnswersFrom(input: {
  projectId: string;
  fromRequirementId: string;
  toRequirementId: string;
}) {
  const { requirementById, matchAssetsForRequirement } = await import(
    "@/lib/decision-trees"
  );
  const fromReq = requirementById(input.fromRequirementId);
  const toReq = requirementById(input.toRequirementId);
  if (!fromReq || !toReq) throw new Error("Requirement not found");

  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    include: { assets: true },
  });
  if (!project) throw new Error("Project not found");

  const parsedAssets = project.assets.map((a) => {
    let metadata: Record<string, string> = {};
    try {
      const parsed = JSON.parse(a.metadata);
      if (parsed && typeof parsed === "object")
        metadata = parsed as Record<string, string>;
    } catch {}
    return { id: a.id, kind: a.kind, metadata };
  });

  const targetAssetIds = toReq.iterateOver
    ? new Set(matchAssetsForRequirement(toReq, parsedAssets).map((a) => a.id))
    : null;

  const fromAnswers = await prisma.dTAnswer.findMany({
    where: { projectId: input.projectId, requirementId: fromReq.id },
  });

  let copied = 0;
  await prisma.$transaction(async (tx) => {
    for (const a of fromAnswers) {
      // Skip nodes that don't exist in the target DT
      if (!toReq.nodes[a.nodeId]) continue;
      // Global vs per-asset scope must match
      if (toReq.iterateOver) {
        if (a.assetId === null) continue;
        if (!targetAssetIds!.has(a.assetId)) continue;
      } else {
        if (a.assetId !== null) continue;
      }

      // Upsert manually (SQLite NULL handling)
      const existing = await tx.dTAnswer.findFirst({
        where: {
          projectId: input.projectId,
          assetId: a.assetId,
          requirementId: toReq.id,
          nodeId: a.nodeId,
        },
      });
      if (existing) {
        await tx.dTAnswer.update({
          where: { id: existing.id },
          data: { answer: a.answer, notes: a.notes },
        });
      } else {
        await tx.dTAnswer.create({
          data: {
            projectId: input.projectId,
            assetId: a.assetId,
            mechanismCode: toReq.mechanismCode,
            requirementId: toReq.id,
            nodeId: a.nodeId,
            answer: a.answer,
            notes: a.notes,
          },
        });
      }
      copied++;
    }
  });

  revalidatePath(`/projects/${input.projectId}/dt`);
  revalidatePath(`/projects/${input.projectId}/dt/${toReq.id}`);
  return { copied };
}

// ── Structured evidence (DTEvidence) ──────────────────────────────
export async function saveDTEvidence(input: {
  projectId: string;
  assetId: string | null;
  requirementId: string;
  fieldId: string;
  value: string;
}) {
  const existing = await prisma.dTEvidence.findFirst({
    where: {
      projectId: input.projectId,
      assetId: input.assetId,
      requirementId: input.requirementId,
      fieldId: input.fieldId,
    },
  });
  if (existing) {
    await prisma.dTEvidence.update({
      where: { id: existing.id },
      data: { value: input.value },
    });
  } else {
    await prisma.dTEvidence.create({
      data: {
        projectId: input.projectId,
        assetId: input.assetId,
        requirementId: input.requirementId,
        fieldId: input.fieldId,
        value: input.value,
      },
    });
  }
  revalidatePath(`/projects/${input.projectId}/evidence`);
}

export async function resetDTEvaluation(input: {
  projectId: string;
  assetId: string | null;
  requirementId: string;
}) {
  await prisma.dTAnswer.deleteMany({
    where: {
      projectId: input.projectId,
      assetId: input.assetId,
      requirementId: input.requirementId,
    },
  });
  revalidatePath(`/projects/${input.projectId}/dt`);
  revalidatePath(`/projects/${input.projectId}/dt/${input.requirementId}`);
}

export async function saveScreening(
  projectId: string,
  answers: ScreeningAnswerMap,
) {
  const result = evaluateScreening(answers);

  await prisma.$transaction(async (tx) => {
    // Replace answers
    await tx.screeningAnswer.deleteMany({ where: { projectId } });
    await tx.screeningAnswer.createMany({
      data: Object.entries(answers).map(([questionId, answer]) => ({
        projectId,
        questionId,
        answer,
      })),
    });
    await tx.project.update({
      where: { id: projectId },
      data: {
        applicable1: result.applicableStandards.includes(1),
        applicable2: result.applicableStandards.includes(2),
        applicable3: result.applicableStandards.includes(3),
        mechanismCandidates: JSON.stringify(result.candidateMechanisms),
        screeningComplete: true,
      },
    });
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
  redirect(`/projects/${projectId}/result`);
}
