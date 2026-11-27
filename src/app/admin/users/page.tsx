import { db } from "@/lib/db";
import { ROLE_LABEL } from "@/lib/auth";
import { createUser, linkParent, unlinkParent, updateUser } from "../actions";

export default async function UsersPage() {
  const users = await db.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }], include: { children: { include: { child: true } } } });
  const students = users.filter((u) => u.role === "STUDENT");
  const parents = users.filter((u) => u.role === "PARENT");
  return (
    <>
      <section className="card">
        <h3>계정 등록</h3>
        <form action={createUser}>
          <div className="row">
            <div><label>아이디</label><input name="username" required /></div>
            <div><label>이름</label><input name="name" required /></div>
            <div><label>초기 비밀번호(6자 이상)</label><input name="password" type="password" minLength={6} required /></div>
            <div>
              <label>역할</label>
              <select name="role" defaultValue="STUDENT">
                {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div><label>학년</label><input name="grade" placeholder="고1" /></div>
            <div><label>학교</label><input name="school" /></div>
            <div><label>수업반</label><input name="classGroup" /></div>
          </div>
          <p><button>등록</button></p>
        </form>
      </section>

      <section className="card">
        <h3>학부모–자녀 연결</h3>
        <form action={linkParent} className="row">
          <div><label>학부모</label><select name="parentId">{parents.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.username})</option>)}</select></div>
          <div><label>자녀(학생)</label><select name="childId">{students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.username})</option>)}</select></div>
          <div><button>연결</button></div>
        </form>
        <ul>
          {parents.flatMap((p) => p.children.map((l) => (
            <li key={l.id}>
              {p.name} → {l.child.name}
              <form action={unlinkParent} style={{ display: "inline" }}>
                <input type="hidden" name="id" value={l.id} /> <button className="ghost">해제</button>
              </form>
            </li>
          )))}
        </ul>
      </section>

      <section className="card">
        <h3>계정 목록</h3>
        {users.map((u) => (
          <details key={u.id}>
            <summary>
              <strong>{u.name}</strong> <span className="badge">{ROLE_LABEL[u.role]}</span>
              <span className="muted">{u.username} {u.active ? "" : "· 비활성"} {[u.school, u.grade, u.classGroup].filter(Boolean).join(" · ")}</span>
            </summary>
            <form action={updateUser}>
              <input type="hidden" name="id" value={u.id} />
              <div className="row">
                <div><label>이름</label><input name="name" defaultValue={u.name} required /></div>
                <div><label>학년</label><input name="grade" defaultValue={u.grade ?? ""} /></div>
                <div><label>학교</label><input name="school" defaultValue={u.school ?? ""} /></div>
                <div><label>수업반</label><input name="classGroup" defaultValue={u.classGroup ?? ""} /></div>
                <div><label>새 비밀번호(선택)</label><input name="password" type="password" /></div>
              </div>
              <p><label style={{ display: "inline" }}><input type="checkbox" name="active" defaultChecked={u.active} style={{ width: "auto" }} /> 활성</label> <button>저장</button></p>
            </form>
          </details>
        ))}
      </section>
    </>
  );
}
