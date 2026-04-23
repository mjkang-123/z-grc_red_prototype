"use client";

import { useState, useTransition } from "react";
import { Lock, Unlock, AlertTriangle, Check } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { finalizeProject, unlockProject } from "@/app/actions";

export function FinalizeControls({
  projectId,
  finalizedAt,
  finalizedBy,
  finalizedNote,
}: {
  projectId: string;
  finalizedAt: string | null;
  finalizedBy: string | null;
  finalizedNote: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [finalizedByInput, setFinalizedByInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  function onFinalize() {
    startTransition(async () => {
      try {
        await finalizeProject({
          projectId,
          finalizedBy: finalizedByInput,
          note: noteInput,
        });
        setOpen(false);
        toast.success("리포트가 확정되었습니다.");
      } catch (err) {
        toast.error("확정 실패");
        console.error(err);
      }
    });
  }

  function onUnlock() {
    if (
      !confirm(
        "확정을 해제하면 프로젝트가 다시 편집 가능해집니다. 계속하시겠습니까?",
      )
    )
      return;
    startTransition(async () => {
      try {
        await unlockProject(projectId);
        toast.success("확정이 해제되었습니다.");
      } catch (err) {
        toast.error("해제 실패");
        console.error(err);
      }
    });
  }

  if (finalizedAt) {
    return (
      <div className="rounded-lg border border-emerald-500/40 bg-emerald-50/60 p-4 dark:bg-emerald-950/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-emerald-600 p-1.5 text-white">
              <Lock className="size-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                리포트 확정됨
              </p>
              <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                {new Date(finalizedAt).toLocaleString("ko-KR")}
                {finalizedBy && ` · ${finalizedBy}`}
              </p>
              {finalizedNote && (
                <p className="mt-1 text-xs text-foreground/80">
                  {finalizedNote}
                </p>
              )}
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                프로젝트 내 모든 입력(DT·증빙·평가·자산 등)은 수정이 잠겼습니다.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onUnlock}
            disabled={pending}
            className="gap-1.5"
          >
            <Unlock className="size-3.5" />
            확정 해제
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" className="gap-1.5">
            <Check className="size-3.5" />
            리포트 확정
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>리포트 확정</DialogTitle>
          <DialogDescription>
            확정 후에는 DT·증빙·평가·자산 등 프로젝트 내 입력이 잠깁니다.
            필요 시 해제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-md border border-amber-500/30 bg-amber-50/40 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle className="mr-1 inline size-3" />
            확정 전 "미완료 항목"을 먼저 확인하세요.
          </div>
          <div className="space-y-2">
            <Label htmlFor="finalizedBy">확정자 (선택)</Label>
            <Input
              id="finalizedBy"
              value={finalizedByInput}
              onChange={(e) => setFinalizedByInput(e.target.value)}
              placeholder="이름 또는 이메일"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">메모 (선택)</Label>
            <Textarea
              id="note"
              rows={3}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="확정 관련 메모·버전 정보 등"
              disabled={pending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            취소
          </Button>
          <Button onClick={onFinalize} disabled={pending}>
            {pending ? "확정 중…" : "확정하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
