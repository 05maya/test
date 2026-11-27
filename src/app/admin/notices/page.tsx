import { db } from "@/lib/db";
import { createNotice, deleteNotice } from "../actions";

const AUD: Record<string, string> = { ALL: "전체", STUDENT: "학생", PARENT: "학부모" };

export default async function NoticesPage() {
  const notices = await db.notice.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <section className="card">
        <h3>공지 등록</h3>
        <form action={createNotice}>
          <label>제목</label><input name="title" required />
          <label>대상</label>
          <select name="audience">{Object.entries(AUD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <label>내용</label><textarea name="body" rows={4} required />
          <p><button>등록</button></p>
        </form>
      </section>
      <section className="card">
        <h3>공지 목록</h3>
        {notices.map((n) => (
          <div className="res" key={n.id}>
            <div><span className="badge">{AUD[n.audience]}</span><strong>{n.title}</strong><div className="muted">{n.createdAt.toLocaleString("ko-KR")}</div></div>
            <form action={deleteNotice}><input type="hidden" name="id" value={n.id} /><button className="danger">삭제</button></form>
          </div>
        ))}
      </section>
    </>
  );
}
