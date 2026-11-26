import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROOMS, canEnter } from "@/lib/rooms";
import { noticeAudienceFor, resourcesForStudent } from "@/lib/access";
import Header from "@/components/Header";

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
        <h1>학원 로비</h1>
        <p className="muted">{user.name}님, 환영합니다. 가고 싶은 공간을 클릭하세요.</p>

        <svg className="map" viewBox="0 0 785 420" role="group" aria-label="학원 건물 지도">
          <rect x="10" y="10" width="765" height="400" rx="14" fill="none" stroke="#8886" strokeDasharray="6 6" />
          {ROOMS.map((r) => {
            const ok = canEnter(r, user.role);
            const body = (
              <g className={`room${ok ? "" : " locked"}`} tabIndex={ok ? 0 : -1}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={10} fill={r.color} />
                <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 4} textAnchor="middle" fontSize="30">{r.icon}</text>
                <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 26} textAnchor="middle" fontSize="16" fontWeight="700" fill="#111">{r.name}</text>
              </g>
            );
            return ok ? (
              <Link key={r.slug} href={`/rooms/${r.slug}`} aria-label={`${r.name} 입장`}>
                {body}
              </Link>
            ) : (
              <g key={r.slug} aria-label={`${r.name} (출입 제한)`}>{body}</g>
            );
          })}
          <rect x="30" y="300" width="170" height="90" rx="10" fill="#d8d2c2" />
          <text x="115" y="352" textAnchor="middle" fontSize="16" fontWeight="700" fill="#333">🚪 로비</text>
        </svg>

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
