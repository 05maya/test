import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const hash = (p: string) => bcrypt.hashSync(p, 10);

async function main() {
  const admin = await db.user.upsert({ where: { username: "admin" }, update: {}, create: { username: "admin", name: "관리자", role: "ADMIN", passwordHash: hash("admin1234") } });
  const s1 = await db.user.upsert({ where: { username: "student1" }, update: {}, create: { username: "student1", name: "김학생", role: "STUDENT", grade: "고1", school: "EST고", classGroup: "A반", passwordHash: hash("student1234") } });
  const s2 = await db.user.upsert({ where: { username: "student2" }, update: {}, create: { username: "student2", name: "이학생", role: "STUDENT", grade: "고2", school: "EST고", classGroup: "B반", passwordHash: hash("student1234") } });
  const p1 = await db.user.upsert({ where: { username: "parent1" }, update: {}, create: { username: "parent1", name: "김학부모", role: "PARENT", passwordHash: hash("parent1234") } });
  await db.user.upsert({ where: { username: "teacher1" }, update: {}, create: { username: "teacher1", name: "박선생", role: "TEACHER", passwordHash: hash("teacher1234") } });
  await db.parentChild.upsert({ where: { parentId_childId: { parentId: p1.id, childId: s1.id } }, update: {}, create: { parentId: p1.id, childId: s1.id } });

  if ((await db.resource.count()) === 0) {
    await db.resource.createMany({
      data: [
        { title: "영어 단어 시험 대비", url: "https://example.com/english", room: "english", scope: "COMMON", description: "전체 공통 자료" },
        { title: "고1 수학 개념 정리", url: "https://example.com/math-g1", room: "math", scope: "GROUP", groupType: "GRADE", groupValue: "고1" },
        { title: "생기부 도서추천", url: "https://example.com/books", room: "korean", scope: "COMMON" },
        { title: "탐구보고서 제작앱", url: "https://example.com/report", room: "science", scope: "COMMON" },
        { title: "탐구보고서 제작앱 (사회)", url: "https://example.com/report", room: "social", scope: "COMMON" },
        { title: "대학별 면접 기출", url: "https://example.com/interview", room: "interview", scope: "COMMON" },
        { title: "학부모 입시 설명회 자료", url: "https://example.com/parent-guide", room: "parents", scope: "COMMON" },
      ],
    });
    const personal = await db.resource.create({ data: { title: "김학생 주간 학습계획표", url: "https://example.com/plan-kim", room: "study", scope: "PERSONAL" } });
    await db.resourceAssignment.create({ data: { resourceId: personal.id, userId: s1.id, note: "이번 주는 수학 오답정리에 집중해 보세요." } });
  }
  if ((await db.notice.count()) === 0) {
    await db.notice.createMany({
      data: [
        { title: "EST Virtual Academy 오픈", body: "가상 학원이 문을 열었습니다.", audience: "ALL" },
        { title: "학부모 상담주간 안내", body: "12월 첫째 주는 학부모 상담주간입니다. 상담실에서 신청해 주세요.", audience: "PARENT" },
      ],
    });
  }
  void admin; void s2;
}
main().finally(() => db.$disconnect());
