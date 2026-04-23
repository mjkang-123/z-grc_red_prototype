"use client";

import { useState, useTransition } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resetScreeningAndDependents } from "@/app/actions";

export function ResetScreeningDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");

  function onReset() {
    if (confirmText !== "처음부터") {
      toast.error("확인을 위해 '처음부터'를 입력하세요.");
      return;
    }
    startTransition(async () => {
      try {
        await resetScreeningAndDependents(projectId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "초기화 실패";
        // NEXT_REDIRECT is normal
        if (msg.includes("NEXT_REDIRECT")) return;
        toast.error(msg);
        console.error(err);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-amber-600/30 text-amber-800 hover:bg-amber-100 dark:text-amber-300"
          >
            <RotateCcw className="size-3.5" />
            전체 초기화
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로젝트 전체 초기화</DialogTitle>
          <DialogDescription>
            스크리닝 답변 및 이후 단계의 모든 입력(DT 답변·증빙·기능 평가)이
            삭제됩니다. 자산 인벤토리와 첨부 파일은 유지됩니다.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs">
          <AlertTriangle className="mr-1 inline size-3 text-destructive" />
          이 작업은 되돌릴 수 없습니다.
        </div>
        <div className="space-y-2 py-2">
          <label className="text-sm">
            계속하려면 아래에{" "}
            <span className="font-mono font-bold">처음부터</span>를 입력하세요.
          </label>
          <input
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={pending}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onReset}
            disabled={pending || confirmText !== "처음부터"}
          >
            {pending ? "초기화 중…" : "초기화"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
