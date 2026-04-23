import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { buildReportData, renderReportPdf } from "@/lib/pdf-report";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let session;
  try {
    session = await requireSession();
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      assets: { orderBy: { createdAt: "asc" } },
      attachments: { orderBy: { createdAt: "asc" } },
      dtAnswers: true,
      dtEvidences: true,
      dtAssessments: true,
      screeningAnswers: true,
    },
  });
  if (!project) {
    return new NextResponse("Project not found", { status: 404 });
  }

  // Access check
  if (session.role !== "consultant" && project.userId !== session.userId) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const isConsultant = session.role === "consultant";
  const data = buildReportData(project, { hideAssessments: !isConsultant });
  const pdf = await renderReportPdf(data);

  const safeFilename = encodeURIComponent(`report-${project.name}.pdf`);
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${safeFilename}`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "private, no-cache, no-store",
    },
  });
}
