"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Paperclip,
  Trash2,
  Upload,
  Check,
  Loader2,
  CircleDashed,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ASSESSMENT_LABEL_KO,
  ASSESSMENT_LABEL_EN,
  type AssessmentType,
} from "@/lib/decision-trees";
import {
  saveDTAssessment,
  uploadAssessmentAttachment,
  deleteAssessmentAttachment,
  type AssessmentVerdict,
} from "@/app/actions";

type AssessmentRecord = {
  type: AssessmentType;
  testMethod: string;
  testResult: string;
  verdict: AssessmentVerdict | null;
  attachment: {
    filename: string;
    mimeType: string;
    size: number;
    // URL key: {projectId}::{assetId}::{reqId}::{assessmentType}
  } | null;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function AssessmentForm({
  projectId,
  assetId,
  requirementId,
  assessments,
  readOnly = false,
}: {
  projectId: string;
  assetId: string | null;
  requirementId: string;
  assessments: AssessmentRecord[];
  readOnly?: boolean;
}) {
  const [records, setRecords] = useState<AssessmentRecord[]>(assessments);

  function updateRecord(
    type: AssessmentType,
    patch: Partial<AssessmentRecord>,
  ) {
    setRecords((prev) =>
      prev.map((r) => (r.type === type ? { ...r, ...patch } : r)),
    );
  }

  return (
    <div className="space-y-3">
      {records.map((rec) => (
        <AssessmentCard
          key={rec.type}
          projectId={projectId}
          assetId={assetId}
          requirementId={requirementId}
          record={rec}
          onChange={(patch) => updateRecord(rec.type, patch)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

function AssessmentCard({
  projectId,
  assetId,
  requirementId,
  record,
  onChange,
  readOnly,
}: {
  projectId: string;
  assetId: string | null;
  requirementId: string;
  record: AssessmentRecord;
  onChange: (patch: Partial<AssessmentRecord>) => void;
  readOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [attPending, startAttTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function save(next: AssessmentRecord) {
    setSaveState("saving");
    startTransition(async () => {
      try {
        await saveDTAssessment({
          projectId,
          assetId,
          requirementId,
          assessmentType: next.type,
          testMethod: next.testMethod,
          testResult: next.testResult,
          verdict: next.verdict,
        });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1600);
      } catch (err) {
        toast.error("저장 실패 / Failed to save.");
        console.error(err);
        setSaveState("error");
      }
    });
  }

  function onCommit() {
    save(record);
  }

  function onVerdictChange(v: AssessmentVerdict | null) {
    const next = { ...record, verdict: v };
    onChange({ verdict: v });
    save(next);
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    startAttTransition(async () => {
      try {
        await uploadAssessmentAttachment({
          projectId,
          assetId,
          requirementId,
          assessmentType: record.type,
          formData: fd,
        });
        onChange({
          attachment: {
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          },
        });
        toast.success("증적 파일이 업로드되었습니다.");
        if (fileRef.current) fileRef.current.value = "";
      } catch (err) {
        const msg = err instanceof Error ? err.message : "업로드 실패";
        toast.error(msg);
        console.error(err);
      }
    });
  }

  function onDeleteAttachment() {
    if (!confirm("이 증적 파일을 삭제하시겠습니까?")) return;
    startAttTransition(async () => {
      try {
        await deleteAssessmentAttachment({
          projectId,
          assetId,
          requirementId,
          assessmentType: record.type,
        });
        onChange({ attachment: null });
      } catch (err) {
        toast.error("삭제 실패");
        console.error(err);
      }
    });
  }

  const typeVariant =
    record.type === "conceptual_completeness"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
      : record.type === "completeness"
        ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
        : "bg-violet-500/15 text-violet-700 dark:text-violet-400";

  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Badge className={cn("text-[11px]", typeVariant)} variant="secondary">
          {ASSESSMENT_LABEL_KO[record.type]}
        </Badge>
        <div className="flex items-center gap-2">
          <SaveIndicator state={saveState} />
          <span className="text-[10px] italic text-muted-foreground">
            {ASSESSMENT_LABEL_EN[record.type]}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-foreground">
            테스트 방법 / Test Method
          </label>
          <Textarea
            value={record.testMethod}
            onChange={(e) => onChange({ testMethod: e.target.value })}
            onBlur={onCommit}
            rows={2}
            className="text-xs"
            placeholder="테스트를 어떻게 수행했는지 기술하세요 (도구, 절차, 입력값 등)."
            disabled={pending || readOnly}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-foreground">
            테스트 결과 / Test Result
          </label>
          <Textarea
            value={record.testResult}
            onChange={(e) => onChange({ testResult: e.target.value })}
            onBlur={onCommit}
            rows={2}
            className="text-xs"
            placeholder="관찰된 동작·로그·증거를 기술하세요."
            disabled={pending || readOnly}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-foreground">
            판정 / Verdict:
          </span>
          <VerdictButton
            current={record.verdict}
            value="pass"
            onSelect={onVerdictChange}
            disabled={pending || readOnly}
          />
          <VerdictButton
            current={record.verdict}
            value="fail"
            onSelect={onVerdictChange}
            disabled={pending || readOnly}
          />
          <VerdictButton
            current={record.verdict}
            value="not_applicable"
            onSelect={onVerdictChange}
            disabled={pending || readOnly}
          />
          {record.verdict && !readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVerdictChange(null)}
              disabled={pending}
              className="ml-auto text-[10px] text-muted-foreground"
            >
              초기화
            </Button>
          )}
        </div>

        {/* Attachment section */}
        <div className="mt-1 border-t pt-2">
          <span className="mb-1.5 block text-[11px] font-medium text-foreground">
            증적 파일 / Evidence File{" "}
            <span className="font-normal text-muted-foreground">
              (최대 1개)
            </span>
          </span>
          {record.attachment ? (
            <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-xs">
              <Paperclip className="size-3 shrink-0 text-muted-foreground" />
              <a
                href={`/api/assessment-attachments?projectId=${projectId}&assetId=${assetId ?? ""}&requirementId=${encodeURIComponent(requirementId)}&type=${record.type}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-primary hover:underline"
              >
                {record.attachment.filename}
              </a>
              <span className="text-[10px] text-muted-foreground">
                {formatSize(record.attachment.size)}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={onDeleteAttachment}
                  disabled={attPending}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                  aria-label="삭제"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          ) : readOnly ? (
            <p className="text-[11px] text-muted-foreground">첨부된 증적 없음</p>
          ) : (
            <div>
              <input
                ref={fileRef}
                type="file"
                onChange={onFileSelected}
                disabled={attPending}
                accept=".pdf,.png,.jpg,.jpeg,.svg,.docx,.xlsx,.doc,.xls,application/pdf,image/png,image/jpeg,image/svg+xml,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.ms-excel"
                className="hidden"
                id={`att-${record.type}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={attPending}
                className="gap-1.5 text-[11px]"
              >
                {attPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Upload className="size-3" />
                )}
                증적 파일 업로드
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerdictButton({
  current,
  value,
  onSelect,
  disabled,
}: {
  current: AssessmentVerdict | null;
  value: AssessmentVerdict;
  onSelect: (v: AssessmentVerdict) => void;
  disabled?: boolean;
}) {
  const active = current === value;
  const label =
    value === "pass" ? "Pass" : value === "fail" ? "Fail" : "N/A";
  const Icon =
    value === "pass" ? CheckCircle2 : value === "fail" ? XCircle : MinusCircle;
  const activeCls =
    value === "pass"
      ? "bg-emerald-600 text-white hover:bg-emerald-600"
      : value === "fail"
        ? "bg-destructive text-destructive-foreground hover:bg-destructive"
        : "bg-secondary text-secondary-foreground hover:bg-secondary";

  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={() => onSelect(value)}
      disabled={disabled}
      className={cn("h-7 text-[11px]", active && activeCls)}
    >
      <Icon className="mr-1 size-3" />
      {label}
    </Button>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  if (state === "saving")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <CircleDashed className="size-2.5 animate-pulse" />
        저장 중
      </span>
    );
  if (state === "saved")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400">
        <Check className="size-2.5" />
        저장됨
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-destructive">
      저장 실패
    </span>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
