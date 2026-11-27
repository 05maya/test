import { db } from "./db";
import type { SessionUser } from "./auth";

type UserLike = Pick<SessionUser, "id" | "role" | "grade" | "school" | "classGroup">;

/** 학생 한 명에게 보이는 자료 (공통 + 그룹 + 개인). */
export async function resourcesForStudent(user: UserLike, room?: string) {
  const roomFilter = room ? { room } : {};
  const groupOr = [
    user.grade ? { groupType: "GRADE", groupValue: user.grade } : null,
    user.school ? { groupType: "SCHOOL", groupValue: user.school } : null,
    user.classGroup ? { groupType: "CLASS", groupValue: user.classGroup } : null,
  ].filter((x): x is { groupType: string; groupValue: string } => x !== null);

  const rows = await db.resource.findMany({
    where: {
      ...roomFilter,
      OR: [
        { scope: "COMMON" },
        ...(groupOr.length ? [{ scope: "GROUP", OR: groupOr }] : []),
        { scope: "PERSONAL", assignments: { some: { userId: user.id } } },
      ],
    },
    include: { assignments: { where: { userId: user.id } } },
    orderBy: [{ scope: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((r) => ({ ...r, note: r.assignments[0]?.note ?? null }));
}

/** 학부모는 연결된 자녀의 정보만 볼 수 있다. */
export async function childrenOf(parentId: number) {
  const links = await db.parentChild.findMany({
    where: { parentId },
    include: { child: true },
  });
  return links.map((l) => l.child);
}

export async function canViewStudent(viewer: UserLike, studentId: number) {
  if (viewer.role === "ADMIN" || viewer.role === "TEACHER") return true;
  if (viewer.role === "STUDENT") return viewer.id === studentId;
  if (viewer.role === "PARENT") {
    return !!(await db.parentChild.findUnique({
      where: { parentId_childId: { parentId: viewer.id, childId: studentId } },
    }));
  }
  return false;
}

export function noticeAudienceFor(role: string): string[] {
  if (role === "PARENT") return ["ALL", "PARENT"];
  if (role === "STUDENT") return ["ALL", "STUDENT"];
  return ["ALL", "STUDENT", "PARENT"];
}

export const SCOPE_LABEL: Record<string, string> = {
  COMMON: "공통",
  GROUP: "그룹",
  PERSONAL: "개인",
};
