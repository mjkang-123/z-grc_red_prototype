"use client";

import { useState, useTransition } from "react";
import { FileUp, Download, Upload, AlertTriangle, Check } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { importAssetsFromCSV } from "@/app/actions";

const CSV_TEMPLATE = `kind,name,description,metadata
security_asset,Firmware image,"main firmware stored in flash",role=core
network_asset,OCPP endpoint,"CSMS communication",protocol=ocpp-1.6
network_interface,WAN Ethernet,primary uplink,medium=wired
`;

export function CSVImportDialog({
  projectId,
  disabled = false,
}: {
  projectId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    created: number;
    errors: string[];
  } | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((t) => setCsvText(t));
  }

  function onImport() {
    if (!csvText.trim()) {
      toast.error("CSV 내용을 입력하거나 파일을 업로드하세요.");
      return;
    }
    setResult(null);
    startTransition(async () => {
      try {
        const res = await importAssetsFromCSV({ projectId, csvText });
        setResult(res);
        if (res.created > 0) {
          toast.success(`${res.created}개 자산이 등록되었습니다.`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "임포트 실패";
        toast.error(msg);
        console.error(err);
      }
    });
  }

  function onClose() {
    setOpen(false);
    // Reset after close animation
    setTimeout(() => {
      setCsvText("");
      setResult(null);
    }, 200);
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asset-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : onClose())}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5" disabled={disabled}>
            <FileUp className="size-3.5" />
            CSV 일괄 등록
          </Button>
        }
      />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>자산 CSV 일괄 등록</DialogTitle>
          <DialogDescription>
            CSV 헤더는 <code className="rounded bg-muted px-1 text-xs">kind,name,description,metadata</code>{" "}
            순서입니다. metadata 셀은 JSON(<code className="text-xs">{'{"role":"edge"}'}</code>) 또는{" "}
            <code className="text-xs">key=value;key=value</code> 형식.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="gap-1.5"
            >
              <Download className="size-3.5" />
              템플릿 다운로드
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border bg-background px-3 py-1 text-xs font-medium hover:bg-muted">
              <Upload className="size-3.5" />
              파일에서 불러오기
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={onFile}
                className="hidden"
                disabled={pending}
              />
            </label>
          </div>

          <Textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={10}
            className="font-mono text-xs"
            placeholder="CSV 내용을 붙여넣거나 파일에서 불러오세요."
            disabled={pending}
          />

          {result && (
            <div className="space-y-2">
              {result.created > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-emerald-500/40 bg-emerald-50/60 p-2.5 text-xs dark:bg-emerald-950/20">
                  <Check className="mt-0.5 size-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">
                    {result.created}개 등록 완료
                  </span>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="rounded-md border border-amber-500/40 bg-amber-50/60 p-2.5 text-xs dark:bg-amber-950/20">
                  <div className="flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="size-3.5" />
                    문제 ({result.errors.length}건)
                  </div>
                  <ul className="mt-1.5 space-y-0.5 pl-4 text-amber-900 dark:text-amber-200">
                    {result.errors.map((e, i) => (
                      <li key={i} className="list-disc">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            닫기
          </Button>
          <Button onClick={onImport} disabled={pending || !csvText.trim()}>
            {pending ? "등록 중…" : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
