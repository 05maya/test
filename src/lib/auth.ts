import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "./db";

const COOKIE = "est_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function createSession(userId: number) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${userId}.${exp}`;
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, exp, sig] = raw.split(".");
  if (!id || !exp || !sig) return null;
  const expected = sign(`${id}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  const user = await db.user.findUnique({ where: { id: Number(id) } });
  return user && user.active ? user : null;
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export const ROLE_LABEL: Record<string, string> = {
  STUDENT: "학생",
  PARENT: "학부모",
  TEACHER: "교사",
  ADMIN: "관리자",
};
