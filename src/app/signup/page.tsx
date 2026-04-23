import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }
  const { next } = await searchParams;
  const userCount = await prisma.user.count();
  const isBootstrap = userCount === 0;
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          회원가입
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            / Sign Up
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Z-GRC RED 계정을 생성합니다.
        </p>
        {isBootstrap && (
          <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
            첫 가입자는 자동으로 컨설턴트(관리자) 권한으로 생성됩니다.
          </div>
        )}
      </div>
      <SignupForm next={next} />
      <p className="text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-primary hover:underline"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
