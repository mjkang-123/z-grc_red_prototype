import Link from "next/link";
import { ArrowLeft, Download, FileText, Image as ImageIcon, Paperclip } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttachmentsManager } from "./attachments-manager";
import { DeleteAttachmentButton as DeleteButton } from "./delete-attachment-button";

export default async function AttachmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href={`/projects/${project.id}/screening`}>
          <Button variant="ghost" size="sm" className="-ml-3">
            <ArrowLeft className="mr-1 size-4" />
            스크리닝
          </Button>
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          첨부 파일
          <span className="ml-2 text-base font-medium text-muted-foreground">
            / Attachments
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          제품 설명서·아키텍처·사양서 등 프로젝트 문서를 관리합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Paperclip className="size-4" />
            등록된 파일 ({project.attachments.length}개)
          </CardTitle>
          <CardDescription>
            파일을 클릭하면 브라우저에서 미리보기/다운로드 됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {project.attachments.length === 0 ? (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              등록된 파일이 없습니다.
            </p>
          ) : (
            project.attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-md border bg-muted/20 p-3"
              >
                <FileIcon mimeType={a.mimeType} />
                <div className="min-w-0 flex-1">
                  <a
                    href={`/api/attachments/${a.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm font-medium text-primary hover:underline"
                  >
                    {a.filename}
                  </a>
                  <p className="text-[11px] text-muted-foreground">
                    {formatSize(a.size)} · {a.mimeType || "알 수 없는 형식"}
                  </p>
                  {a.description && (
                    <p className="mt-1 text-xs text-foreground/80">
                      {a.description}
                    </p>
                  )}
                </div>
                <AttachmentActions
                  projectId={project.id}
                  attachmentId={a.id}
                  filename={a.filename}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AttachmentsManager projectId={project.id} />
    </div>
  );
}

function FileIcon({ mimeType }: { mimeType: string }) {
  const isImage = mimeType.startsWith("image/");
  const Icon = isImage ? ImageIcon : FileText;
  return (
    <div className="mt-0.5 rounded bg-background p-2">
      <Icon className="size-4 text-muted-foreground" />
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentActions({
  projectId,
  attachmentId,
  filename,
}: {
  projectId: string;
  attachmentId: string;
  filename: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <a
        href={`/api/attachments/${attachmentId}`}
        download={filename}
        className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
        aria-label="다운로드"
      >
        <Download className="size-3.5" />
      </a>
      <DeleteButton projectId={projectId} attachmentId={attachmentId} />
    </div>
  );
}

