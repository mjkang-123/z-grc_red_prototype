import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const att = await prisma.projectAttachment.findUnique({ where: { id } });
  if (!att) {
    return new NextResponse("Not found", { status: 404 });
  }
  const fullPath = path.join(process.cwd(), "uploads", att.storedPath);
  try {
    const buffer = await fs.readFile(fullPath);
    // Content-Disposition: inline so PDFs/images open in-browser by default.
    // Use RFC 5987 UTF-8 filename for Korean/unicode support.
    const encodedName = encodeURIComponent(att.filename);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": att.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename*=UTF-8''${encodedName}`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("File missing on disk", { status: 410 });
  }
}
