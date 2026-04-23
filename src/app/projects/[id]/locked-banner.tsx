import Link from "next/link";
import { Lock } from "lucide-react";

export function LockedBanner({
  projectId,
  finalizedAt,
  finalizedBy,
}: {
  projectId: string;
  finalizedAt: Date | null;
  finalizedBy: string | null;
}) {
  if (!finalizedAt) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-emerald-500/40 bg-emerald-50/60 px-3 py-2 text-xs dark:bg-emerald-950/20">
      <div className="flex items-center gap-2">
        <Lock className="size-3.5 text-emerald-700 dark:text-emerald-400" />
        <span className="font-medium text-emerald-800 dark:text-emerald-300">
          리포트 확정됨 — 읽기 전용
        </span>
        <span className="text-muted-foreground">
          ({new Date(finalizedAt).toLocaleString("ko-KR")}
          {finalizedBy && ` · ${finalizedBy}`})
        </span>
      </div>
      <Link
        href={`/projects/${projectId}/report`}
        className="text-primary underline"
      >
        리포트에서 확정 해제
      </Link>
    </div>
  );
}
