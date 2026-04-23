"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Paperclip, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addProjectAttachments } from "@/app/actions";

const ATTACHMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.svg,.docx,.xlsx,.doc,.xls,application/pdf,image/png,image/jpeg,image/svg+xml,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.ms-excel";

export function AttachmentsManager({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();
  const [slotIds, setSlotIds] = useState<number[]>([0]);
  const nextIdRef = useRef(1);
  const formRef = useRef<HTMLFormElement>(null);

  function addSlot() {
    setSlotIds((prev) => [...prev, nextIdRef.current++]);
  }

  function removeSlot(id: number) {
    setSlotIds((prev) =>
      prev.length > 1 ? prev.filter((i) => i !== id) : prev,
    );
  }

  function reset() {
    setSlotIds([0]);
    nextIdRef.current = 1;
    formRef.current?.reset();
  }

  async function onSubmit(formData: FormData) {
    // Check if at least one file is present
    const files = formData.getAll("attachments").filter((f) => f instanceof File) as File[];
    const hasFile = files.some((f) => f && f.size > 0);
    if (!hasFile) {
      toast.error("업로드할 파일을 선택하세요.");
      return;
    }
    startTransition(async () => {
      try {
        await addProjectAttachments(projectId, formData);
        toast.success("파일이 업로드되었습니다.");
        reset();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "업로드 실패";
        toast.error(msg);
        console.error(err);
      }
    });
  }

  return (
    <form ref={formRef} action={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="size-4" />
            파일 추가
          </CardTitle>
          <CardDescription>
            PDF, 이미지, DOCX, XLSX (파일당 최대 50MB).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {slotIds.map((id, idx) => (
            <div
              key={id}
              className="relative rounded-md border bg-muted/20 p-3 pr-9"
            >
              <div className="mb-2 flex items-center gap-2">
                <Paperclip className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  파일 #{idx + 1}
                </span>
              </div>
              <div className="space-y-2">
                <Input
                  type="file"
                  name="attachments"
                  accept={ATTACHMENT_ACCEPT}
                  disabled={pending}
                  className="cursor-pointer text-xs file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-[11px]"
                />
                <Input
                  name="descriptions"
                  disabled={pending}
                  placeholder="설명 (예: v1.2 사용자 매뉴얼)"
                  className="text-xs"
                />
              </div>
              {slotIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlot(id)}
                  disabled={pending}
                  className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-background hover:text-destructive"
                  aria-label="파일 슬롯 제거"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSlot}
              disabled={pending}
              className="flex-1 border-dashed"
            >
              <Plus className="mr-1 size-3.5" />
              파일 추가
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "업로드 중…" : "업로드"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
