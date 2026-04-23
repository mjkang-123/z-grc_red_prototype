"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/actions-auth";
import type { Session } from "@/lib/auth";

export function UserMenu({ session }: { session: Session }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onLogout() {
    startTransition(async () => {
      try {
        await logoutAction();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("NEXT_REDIRECT")) {
          router.refresh();
          return;
        }
        console.error(err);
      }
    });
  }

  const isConsultant = session.role === "consultant";
  const display = session.name || session.email;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs">
        {isConsultant ? (
          <ShieldCheck className="size-3.5 text-primary" />
        ) : (
          <UserIcon className="size-3.5 text-muted-foreground" />
        )}
        <span className="max-w-[160px] truncate font-medium">{display}</span>
        <Badge
          variant="outline"
          className={
            isConsultant
              ? "border-primary/40 text-[10px] text-primary"
              : "text-[10px]"
          }
        >
          {isConsultant ? "컨설턴트" : "고객"}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onLogout}
        disabled={pending}
        className="gap-1 text-xs"
      >
        <LogOut className="size-3" />
        로그아웃
      </Button>
    </div>
  );
}
