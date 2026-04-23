"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction } from "@/app/actions-auth";

export function SignupForm({ next }: { next?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(fd: FormData) {
    setError(null);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const name = String(fd.get("name") ?? "");
    startTransition(async () => {
      const res = await signupAction({ email, password, name });
      if (res.ok) {
        toast.success("가입이 완료되었습니다.");
        router.replace(next && next.startsWith("/") ? next : res.redirectTo);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form action={onSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">이름 / Name (선택)</Label>
            <Input
              id="name"
              name="name"
              disabled={pending}
              placeholder="홍길동"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일 / Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 / Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={pending}
            />
            <p className="text-[10px] text-muted-foreground">
              최소 6자 이상.
            </p>
          </div>
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
            가입하기
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
