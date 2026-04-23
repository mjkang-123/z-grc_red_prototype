"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProjectAttachment } from "@/app/actions";

export function DeleteAttachmentButton({
  projectId,
  attachmentId,
}: {
  projectId: string;
  attachmentId: string;
}) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("이 파일을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      try {
        await deleteProjectAttachment({ projectId, attachmentId });
      } catch (err) {
        toast.error("삭제 실패");
        console.error(err);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-destructive disabled:opacity-50"
      aria-label="삭제"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
