import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectSidebar } from "./sidebar";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      manufacturer: true,
      screeningComplete: true,
      _count: { select: { assets: true, dtAnswers: true } },
    },
  });
  if (!project) notFound();

  // Compute simple completion flags for sidebar badges.
  const assetCount = project._count.assets;
  const hasDTAnswers = project._count.dtAnswers > 0;
  // Distinguish assets (non-mechanism) vs mechanism instances.
  const mechanismKinds = [
    "access_control_mechanism",
    "authentication_mechanism",
    "secure_update_mechanism",
    "secure_storage_mechanism",
    "secure_communication_mechanism",
    "logging_mechanism",
    "deletion_mechanism",
    "user_notification_mechanism",
  ];
  const mechanismCount = await prisma.asset.count({
    where: { projectId: id, kind: { in: mechanismKinds } },
  });
  const nonMechanismAssetCount = assetCount - mechanismCount;

  const sidebarProject = {
    id: project.id,
    name: project.name,
    manufacturer: project.manufacturer,
    screeningComplete: project.screeningComplete,
    hasAssets: nonMechanismAssetCount > 0,
    hasMechanisms: mechanismCount > 0,
    hasDTAnswers,
  };

  return (
    <div className="flex gap-6">
      <ProjectSidebar project={sidebarProject} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
