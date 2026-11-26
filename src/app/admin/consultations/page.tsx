import { db } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/auth";
import { updateConsultation } from "../actions";

export default async function ConsultationsPage() {
  const list = await db.consultation.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } });
  return (
    <section className="card">
      <h3>상담 신청 관리</h3>
      {list.length === 0 && <p className="muted">신청 내역이 없습니다.</p>}
      {list.map((c) => (
        <details key={c.id}>
          <summary>
            <span className="badge">{c.status}</span><strong>{c.topic}</strong>{" "}
            <span className="muted">{c.user.name} ({ROLE_LABEL[c.user.role]}) · 희망 {c.preferredAt ?? "-"}</span>
          </summary>
          {c.detail && <p style={{ whiteSpace: "pre-wrap" }}>{c.detail}</p>}
          <form action={updateConsultation}>
            <input type="hidden" name="id" value={c.id} />
            <div className="row">
              <div><label>상태</label>
                <select name="status" defaultValue={c.status}>
                  <option value="REQUESTED">신청됨</option><option value="CONFIRMED">일정 확정</option>
                  <option value="DONE">완료</option><option value="CANCELED">취소</option>
                </select></div>
              <div><label>확정 일정</label><input name="scheduledAt" defaultValue={c.scheduledAt ?? ""} /></div>
              <div><label>메모(신청자에게 표시)</label><input name="adminNote" defaultValue={c.adminNote ?? ""} /></div>
            </div>
            <p><button>저장</button></p>
          </form>
        </details>
      ))}
    </section>
  );
}
