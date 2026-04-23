"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DownloadPdfButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);

  async function onDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/report.pdf`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${projectId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("PDF 생성 실패");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={onDownload}
      disabled={loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <FileDown className="size-3.5" />
      )}
      PDF 저장
    </Button>
  );
}
