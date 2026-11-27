"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSession, destroySession, requireUser } from "@/lib/auth";

export async function login(_: string | null, form: FormData): Promise<string | null> {
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const user = await db.user.findUnique({ where: { username } });
  // 계정 존재 여부와 무관하게 비교 시간을 비슷하게 유지
  const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali";
  const ok = await bcrypt.compare(password, hash);
  if (!user || !user.active || !ok) return "아이디 또는 비밀번호가 올바르지 않습니다.";
  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function requestConsultation(form: FormData) {
  const user = await requireUser();
  const topic = String(form.get("topic") ?? "").trim();
  if (!topic) return;
  // 학부모/학생 본인 명의로만 신청
  await db.consultation.create({
    data: {
      userId: user.id,
      topic: topic.slice(0, 200),
      detail: String(form.get("detail") ?? "").slice(0, 2000) || null,
      preferredAt: String(form.get("preferredAt") ?? "").slice(0, 100) || null,
    },
  });
  revalidatePath("/rooms/counsel");
  revalidatePath("/rooms/parents");
}

export async function cancelConsultation(form: FormData) {
  const user = await requireUser();
  const id = Number(form.get("id"));
  await db.consultation.updateMany({
    where: { id, userId: user.id, status: "REQUESTED" },
    data: { status: "CANCELED" },
  });
  revalidatePath("/rooms/counsel");
  revalidatePath("/rooms/parents");
}
