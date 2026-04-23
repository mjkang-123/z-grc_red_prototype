import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <ShieldAlert className="size-10" />
      </div>
      <div>
        <h1 className="text-xl font-bold">접근 권한 없음</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          이 페이지는 컨설턴트만 접근할 수 있습니다.
        </p>
      </div>
      <Link href="/">
        <Button variant="outline">홈으로</Button>
      </Link>
    </div>
  );
}
