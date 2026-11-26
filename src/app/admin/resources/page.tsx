import { db } from "@/lib/db";
import { ROOMS } from "@/lib/rooms";
import { SCOPE_LABEL } from "@/lib/access";
import { bulkAssign, createResource, deleteResource, unassign } from "../actions";

function StudentPicker({ students }: { students: { id: number; name: string; grade: string | null; school: string | null }[] }) {
  return (
    <fieldset style={{ border: "1px solid var(--line)", borderRadius: 8, maxHeight: 180, overflow: "auto" }}>
      <legend className="muted">대상 학생(복수 선택)</legend>
      {students.map((s) => (
        <label key={s.id} style={{ display: "block", margin: "2px 0" }}>
          <input type="checkbox" name="userIds" value={s.id} style={{ width: "auto" }} /> {s.name}{" "}
          <span className="muted">{[s.school, s.grade].filter(Boolean).join(" · ")}</span>
        </label>
      ))}
    </fieldset>
  );
}

export default async function ResourcesPage() {
  const [resources, students] = await Promise.all([
    db.resource.findMany({ orderBy: [{ room: "asc" }, { createdAt: "desc" }], include: { assignments: { include: { user: true } } } }),
    db.user.findMany({ where: { role: "STUDENT", active: true }, orderBy: { name: "asc" } }),
  ]);
  const roomName = (slug: string) => ROOMS.find((r) => r.slug === slug)?.name ?? slug;
  return (
    <>
      <section className="card">
        <h3>자료 등록 / 외부 링크 연결</h3>
        <form action={createResource}>
          <div className="row">
            <div><label>제목</label><input name="title" required /></div>
            <div><label>링크(http/https)</label><input name="url" type="url" required /></div>
            <div><label>교실</label><select name="room">{ROOMS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}</select></div>
          </div>
          <label>설명</label><input name="description" />
          <div className="row">
            <div><label>공개 범위</label>
              <select name="scope"><option value="COMMON">공통 (전체)</option><option value="GROUP">그룹 (학년·학교·반)</option><option value="PERSONAL">개인 (선택 학생)</option></select>
            </div>
            <div><label>그룹 기준 (그룹일 때)</label>
              <select name="groupType"><option value="GRADE">학년</option><option value="SCHOOL">학교</option><option value="CLASS">수업반</option></select>
            </div>
            <div><label>그룹 값 (예: 고1)</label><input name="groupValue" /></div>
          </div>
          <p className="muted">개인 자료는 아래에서 학생을 선택하세요. 여러 명 일괄 배정됩니다.</p>
          <StudentPicker students={students} />
          <p><button>등록</button></p>
        </form>
      </section>

      <section className="card">
        <h3>등록된 자료</h3>
        {resources.map((r) => (
          <details key={r.id}>
            <summary>
              <span className="badge">{roomName(r.room)}</span><span className="badge">{SCOPE_LABEL[r.scope]}{r.groupValue ? `: ${r.groupValue}` : ""}</span>
              <strong>{r.title}</strong>
              {r.assignments.length > 0 && <span className="muted"> · 배정 {r.assignments.length}명</span>}
            </summary>
            <p className="muted"><a href={r.url} target="_blank" rel="noopener noreferrer">{r.url}</a></p>
            <ul>
              {r.assignments.map((a) => (
                <li key={a.id}>{a.user.name}{a.note ? ` — ${a.note}` : ""}
                  <form action={unassign} style={{ display: "inline" }}><input type="hidden" name="id" value={a.id} /> <button className="ghost">해제</button></form>
                </li>
              ))}
            </ul>
            <form action={bulkAssign}>
              <input type="hidden" name="resourceId" value={r.id} />
              <StudentPicker students={students} />
              <label>개인 피드백/메모 (선택)</label><input name="note" />
              <p><button>선택 학생에게 일괄 배정</button></p>
            </form>
            <form action={deleteResource}><input type="hidden" name="id" value={r.id} /><button className="danger">자료 삭제</button></form>
          </details>
        ))}
        {resources.length === 0 && <p className="muted">등록된 자료가 없습니다.</p>}
      </section>
    </>
  );
}
