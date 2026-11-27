"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ROOMS } from "@/lib/rooms";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => s(f, k) || null;
const ints = (f: FormData, k: string) =>
  f.getAll(k).map(Number).filter((n) => Number.isInteger(n) && n > 0);

function safeUrl(raw: string) {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

// ---- 사용자 ----
export async function createUser(form: FormData) {
  await requireAdmin();
  const username = s(form, "username");
  const password = s(form, "password");
  const role = s(form, "role");
  if (!username || password.length < 6 || !["STUDENT", "PARENT", "TEACHER", "ADMIN"].includes(role)) return;
  if (await db.user.findUnique({ where: { username } })) return;
  await db.user.create({
    data: {
      username,
      name: s(form, "name") || username,
      role,
      grade: opt(form, "grade"),
      school: opt(form, "school"),
      classGroup: opt(form, "classGroup"),
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  revalidatePath("/admin/users");
}

export async function updateUser(form: FormData) {
  const me = await requireAdmin();
  const id = Number(form.get("id"));
  const password = s(form, "password");
  await db.user.update({
    where: { id },
    data: {
      name: s(form, "name"),
      grade: opt(form, "grade"),
      school: opt(form, "school"),
      classGroup: opt(form, "classGroup"),
      // 본인 계정은 비활성화할 수 없음
      active: id === me.id ? true : form.get("active") === "on",
      ...(password.length >= 6 ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
  });
  revalidatePath("/admin/users");
}

export async function linkParent(form: FormData) {
  await requireAdmin();
  const parentId = Number(form.get("parentId"));
  const childId = Number(form.get("childId"));
  if (!parentId || !childId) return;
  const [p, c] = await Promise.all([db.user.findUnique({ where: { id: parentId } }), db.user.findUnique({ where: { id: childId } })]);
  if (p?.role !== "PARENT" || c?.role !== "STUDENT") return;
  await db.parentChild.upsert({
    where: { parentId_childId: { parentId, childId } },
    create: { parentId, childId },
    update: {},
  });
  revalidatePath("/admin/users");
}

export async function unlinkParent(form: FormData) {
  await requireAdmin();
  await db.parentChild.delete({ where: { id: Number(form.get("id")) } }).catch(() => {});
  revalidatePath("/admin/users");
}

// ---- 자료 ----
export async function createResource(form: FormData) {
  await requireAdmin();
  const url = safeUrl(s(form, "url"));
  const room = s(form, "room");
  const scope = s(form, "scope");
  const title = s(form, "title");
  if (!url || !title || !ROOMS.some((r) => r.slug === room) || !["COMMON", "GROUP", "PERSONAL"].includes(scope)) return;

  const groupType = scope === "GROUP" ? s(form, "groupType") : null;
  const groupValue = scope === "GROUP" ? s(form, "groupValue") : null;
  if (scope === "GROUP" && (!["GRADE", "SCHOOL", "CLASS"].includes(groupType ?? "") || !groupValue)) return;

  const resource = await db.resource.create({
    data: { title, url, room, scope, groupType, groupValue, description: opt(form, "description") },
  });

  // 개인 자료: 선택한 여러 학생에게 일괄 배정
  if (scope === "PERSONAL") {
    const userIds = ints(form, "userIds");
    if (userIds.length)
      await db.resourceAssignment.createMany({ data: userIds.map((userId) => ({ resourceId: resource.id, userId })) });
  }
  revalidatePath("/admin/resources");
}

export async function deleteResource(form: FormData) {
  await requireAdmin();
  await db.resource.delete({ where: { id: Number(form.get("id")) } }).catch(() => {});
  revalidatePath("/admin/resources");
}

/** 기존 자료를 여러 학생에게 일괄 배정 (개인 자료로 전환하지 않고 추가 배정). */
export async function bulkAssign(form: FormData) {
  await requireAdmin();
  const resourceId = Number(form.get("resourceId"));
  const userIds = ints(form, "userIds");
  const note = opt(form, "note");
  if (!resourceId || !userIds.length) return;
  for (const userId of userIds) {
    await db.resourceAssignment.upsert({
      where: { resourceId_userId: { resourceId, userId } },
      create: { resourceId, userId, note },
      update: { note },
    });
  }
  revalidatePath("/admin/resources");
}

export async function unassign(form: FormData) {
  await requireAdmin();
  await db.resourceAssignment.delete({ where: { id: Number(form.get("id")) } }).catch(() => {});
  revalidatePath("/admin/resources");
}

// ---- 공지 ----
export async function createNotice(form: FormData) {
  await requireAdmin();
  const title = s(form, "title");
  const body = s(form, "body");
  const audience = s(form, "audience");
  if (!title || !body || !["ALL", "STUDENT", "PARENT"].includes(audience)) return;
  await db.notice.create({ data: { title, body, audience } });
  revalidatePath("/admin/notices");
  revalidatePath("/");
}

export async function deleteNotice(form: FormData) {
  await requireAdmin();
  await db.notice.delete({ where: { id: Number(form.get("id")) } }).catch(() => {});
  revalidatePath("/admin/notices");
  revalidatePath("/");
}

// ---- 상담 ----
export async function updateConsultation(form: FormData) {
  await requireAdmin();
  const status = s(form, "status");
  if (!["REQUESTED", "CONFIRMED", "DONE", "CANCELED"].includes(status)) return;
  await db.consultation.update({
    where: { id: Number(form.get("id")) },
    data: { status, scheduledAt: opt(form, "scheduledAt"), adminNote: opt(form, "adminNote") },
  });
  revalidatePath("/admin/consultations");
}
