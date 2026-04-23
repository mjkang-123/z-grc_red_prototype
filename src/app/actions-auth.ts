"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  type Role,
} from "@/lib/auth";

export type AuthResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function signupAction(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const name = input.name?.trim() || null;

  if (!email || !password) {
    return { ok: false, error: "이메일과 비밀번호는 필수입니다." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "올바른 이메일 형식이 아닙니다." };
  }
  if (password.length < 6) {
    return { ok: false, error: "비밀번호는 최소 6자 이상이어야 합니다." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "이미 사용 중인 이메일입니다." };
  }

  // First user in the system becomes the consultant automatically (bootstrap).
  const userCount = await prisma.user.count();
  const role: Role = userCount === 0 ? "consultant" : "customer";

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role },
  });

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    role: user.role as Role,
    name: user.name,
  });

  return { ok: true, redirectTo: "/" };
}

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, error: "이메일과 비밀번호를 입력하세요." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { ok: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." };
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    role: user.role as Role,
    name: user.name,
  });

  return { ok: true, redirectTo: "/" };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
