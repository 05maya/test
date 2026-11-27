import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { noticeAudienceFor, resourcesForStudent } from "@/lib/access";
import Header from "@/components/Header";
import AcademyLobby from "@/components/AcademyLobby";
import DailyMotto from "@/components/DailyMotto";

export default async function Lobby() {
  const user = await requireUser();
  const notices = await db.notice.findMany({
    where: { audience: { in: noticeAudienceFor(user.role) } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // 개인별 알림: 학생에게 새로 배정된 개인 자료 / 상담 상태 변경
  let personal: { id: string; text: string; href: string }[] = [];
  if (user.role === "STUDENT") {
    const mine = (await resourcesForStudent(user)).filter((r) => r.scope === "PERSONAL").slice(0, 5);
    personal = mine.map((r) => ({ id: `r${r.id}`, text: `나에게 배정된 자료: ${r.title}`, href: `/rooms/${r.room}` }));
  }
  const confirmed = await db.consultation.findMany({
    where: { userId: user.id, status: "CONFIRMED" },
    take: 3,
  });
  personal.push(
    ...confirmed.map((c) => ({
      id: `c${c.id}`,
      text: `상담 확정: ${c.topic}${c.scheduledAt ? ` (${c.scheduledAt})` : ""}`,
      href: "/rooms/counsel",
    })),
  );

  return (
    <>
      <Header user={user} />
      <main className="wrap">
        <DailyMotto />
        <h1>학원 로비</h1>
        <p className="muted">{user.name}님, 환영합니다. 문을 눌러 원하는 공간으로 들어가세요.</p>

        <AcademyLobby role={user.role} />

        <div className="grid" style={{ marginTop: 16 }}>
          <section className="card">
            <h3>📢 공지사항</h3>
            {notices.length === 0 && <p className="muted">등록된 공지가 없습니다.</p>}
            {notices.map((n) => (
              <details key={n.id}>
                <summary>
                  <strong>{n.title}</strong>{" "}
                  <span className="muted">{n.createdAt.toLocaleDateString("ko-KR")}</span>
                </summary>
                <p style={{ whiteSpace: "pre-wrap" }}>{n.body}</p>
              </details>
            ))}
          </section>
          <section className="card">
            <h3>🔔 내 알림</h3>
            {personal.length === 0 && <p className="muted">새 알림이 없습니다.</p>}
            <ul>
              {personal.map((p) => (
                <li key={p.id}><Link href={p.href}>{p.text}</Link></li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
