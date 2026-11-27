import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEnter, roomBySlug } from "@/lib/rooms";
import { childrenOf, noticeAudienceFor, resourcesForStudent } from "@/lib/access";
import { cancelConsultation, requestConsultation } from "@/app/actions";
import Header from "@/components/Header";
import ClassroomScene from "@/components/ClassroomScene";
import { classroomFor } from "@/lib/classrooms";
import { MATH_FORMULAS } from "@/lib/math";
import { VOCAB } from "@/lib/vocab";
import { FormulaHtml } from "@/components/FormulaHtml";
import { kstDayNumber } from "@/lib/mottos";
import LibraryRoom from "@/components/LibraryRoom";
import StudyRoom from "@/components/StudyRoom";
import CounselRoom from "@/components/CounselRoom";
import InterviewRoom from "@/components/InterviewRoom";
import HallRoom from "@/components/HallRoom";
import TeacherChat from "@/components/TeacherChat";
import { HALL_ENTRIES } from "@/lib/hall";
import { INTERVIEW_FILES } from "@/lib/interview";
import { COUNSEL_FILES } from "@/lib/counsel";
import { PLANNER_URL } from "@/lib/study";
import { SHELVES } from "@/lib/library";
import ResourceList from "@/components/ResourceList";

const STATUS: Record<string, string> = {
  REQUESTED: "신청됨",
  CONFIRMED: "일정 확정",
  DONE: "완료",
  CANCELED: "취소",
};

async function ConsultSection({ userId }: { userId: number }) {
  const mine = await db.consultation.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <section className="card">
        <h3>상담 신청</h3>
        <form action={requestConsultation}>
          <label htmlFor="topic">상담 주제</label>
          <input id="topic" name="topic" required maxLength={200} placeholder="예: 진로 상담, 수학 학습 방법" />
          <label htmlFor="preferredAt">희망 일시</label>
          <input id="preferredAt" name="preferredAt" maxLength={100} placeholder="예: 12/3 수요일 오후 5시" />
          <label htmlFor="detail">상세 내용</label>
          <textarea id="detail" name="detail" rows={3} maxLength={2000} />
          <p><button>신청하기</button></p>
        </form>
      </section>
      <section className="card">
        <h3>내 상담 내역</h3>
        {mine.length === 0 && <p className="muted">신청 내역이 없습니다.</p>}
        {mine.map((c) => (
          <div className="res" key={c.id}>
            <div>
              <strong>{c.topic}</strong> <span className="badge">{STATUS[c.status]}</span>
              <div className="muted">
                {c.scheduledAt ? `확정 일정: ${c.scheduledAt}` : c.preferredAt ? `희망: ${c.preferredAt}` : ""}
              </div>
              {c.adminNote && <div>💬 {c.adminNote}</div>}
            </div>
            {c.status === "REQUESTED" && (
              <form action={cancelConsultation}>
                <input type="hidden" name="id" value={c.id} />
                <button className="ghost">취소</button>
              </form>
            )}
          </div>
        ))}
      </section>
    </>
  );
}

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = roomBySlug(slug);
  if (!room) notFound();
  const user = await requireUser();
  if (!canEnter(room, user.role)) redirect("/");
  const classroom = classroomFor(slug);

  let content: React.ReactNode;

  if (slug === "counsel") {
    content = <ConsultSection userId={user.id} />;
  } else if (slug === "parents") {
    const notices = await db.notice.findMany({
      where: { audience: { in: noticeAudienceFor(user.role) } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const kids = user.role === "PARENT" ? await childrenOf(user.id) : [];
    const items =
      user.role === "PARENT"
        ? (await db.resource.findMany({ where: { room: "parents" }, orderBy: { createdAt: "desc" } })).map((r) => ({ ...r, note: null }))
        : (await resourcesForStudent(user, "parents"));
    content = (
      <>
        <section className="card">
          <h3>📢 학부모 공지</h3>
          {notices.length === 0 && <p className="muted">공지가 없습니다.</p>}
          {notices.map((n) => (
            <details key={n.id}>
              <summary><strong>{n.title}</strong> <span className="muted">{n.createdAt.toLocaleDateString("ko-KR")}</span></summary>
              <p style={{ whiteSpace: "pre-wrap" }}>{n.body}</p>
            </details>
          ))}
        </section>
        {user.role === "PARENT" && (
          <section className="card">
            <h3>👨‍👩‍👧 연결된 자녀</h3>
            {kids.length === 0 && <p className="muted">연결된 자녀가 없습니다. 학원에 문의해 주세요.</p>}
            <ul>
              {kids.map((k) => (
                <li key={k.id}>
                  {k.name} <span className="muted">{[k.school, k.grade].filter(Boolean).join(" · ")}</span>
                </li>
              ))}
            </ul>
            <p className="muted">자녀 학습현황·학습계획 확인은 향후 단계(F-11)에서 제공됩니다.</p>
          </section>
        )}
        <section className="card">
          <h3>📚 학부모 교육자료</h3>
          <ResourceList items={items} empty="등록된 교육자료가 없습니다." />
        </section>
        {user.role === "PARENT" && <ConsultSection userId={user.id} />}
      </>
    );
  } else {
    const items = user.role === "STUDENT"
      ? await resourcesForStudent(user, slug)
      : (await db.resource.findMany({ where: { room: slug }, orderBy: { createdAt: "desc" } })).map((r) => ({ ...r, note: null }));
    content = (
      <>
        {slug === "study" && (
          <section className="card">
            <h3>🎮 인생게임 플래너</h3>
            <p className="muted">자기주도학습 계획을 세우고 관리하는 도구입니다.</p>
            <a className="btn" href={PLANNER_URL} target="_blank" rel="noopener noreferrer">플래너 실행</a>
          </section>
        )}
        {slug === "hall" && (
          <section className="card">
            <h3>🏆 명예의 전당 명단</h3>
            <ul>
              {HALL_ENTRIES.map((e) => (
                <li key={`${e.kicker}-${e.name}`}>{e.kicker} {e.headline} · <strong>{e.name}</strong></li>
              ))}
            </ul>
          </section>
        )}
        {(slug !== "hall" || items.length > 0) && (
          <section className="card">
            <h3>{slug === "study" ? "내 학습계획 · 자료 바로가기" : "학습자료"}</h3>
            <ResourceList items={items} />
          </section>
        )}
      </>
    );
  }

  return (
    <>
      <Header user={user} />
      <main className="wrap">
        <p><Link href="/">← 로비로</Link></p>
        {classroom && <ClassroomScene room={classroom} mathStart={kstDayNumber()} />}
        {slug === "library" && <LibraryRoom shelves={SHELVES} />}
        {slug === "study" && <StudyRoom plannerUrl={PLANNER_URL} />}
        {slug === "counsel" && <CounselRoom files={COUNSEL_FILES} />}
        {slug === "interview" && <InterviewRoom files={INTERVIEW_FILES} />}
        {slug === "hall" && <HallRoom entries={HALL_ENTRIES} />}
        <h1>{room.icon} {room.name}</h1>
        <p className="muted">{room.desc}</p>
        {classroom && (
          <TeacherChat name={user.name} teacher={`${classroom.subject} 선생님`} roomName={room.name} assignment={classroom.assignment} link={classroom.link} great={classroom.great} ok={classroom.ok} />
        )}
        {slug === "korean" && (
          <details className="card">
            <summary><strong>칠판에 나오는 어휘 전체 보기</strong> <span className="muted">({VOCAB.length}개)</span></summary>
            <ul className="formulas">
              {VOCAB.map((v) => (
                <li key={v.word}><strong>{v.word}</strong> <span className="muted">{v.hanja}</span><br />{v.meaning}</li>
              ))}
            </ul>
          </details>
        )}
        {classroom?.board.kind === "quiz" && (
          <details className="card">
            <summary><strong>칠판에 나오는 퀴즈 전체 보기</strong> <span className="muted">({classroom.board.items.length}문제 · 정답 포함)</span></summary>
            <ul className="formulas">
              {classroom.board.items.map((q) => (
                <li key={q.q}><span className="muted">{q.tag}</span><br /><FormulaHtml src={q.q} /><br /><span className="muted">정답:</span> <strong><FormulaHtml src={q.a} /></strong></li>
              ))}
            </ul>
          </details>
        )}
        {slug === "math" && (
          <details className="card">
            <summary><strong>칠판에 나오는 공식 전체 보기</strong> <span className="muted">({MATH_FORMULAS.length}개)</span></summary>
            <ul className="formulas">
              {MATH_FORMULAS.map((m) => (
                <li key={m.tag + m.f}><span className="muted">{m.tag}</span><br /><FormulaHtml src={m.f} /></li>
              ))}
            </ul>
          </details>
        )}
        {content}
      </main>
    </>
  );
}
