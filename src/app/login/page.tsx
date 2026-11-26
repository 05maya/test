"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <div className="wrap" style={{ maxWidth: 400, paddingTop: 80 }}>
      <div className="card">
        <h2>🏫 EST Virtual Academy</h2>
        <p className="muted">가상 학원에 입장하려면 로그인하세요.</p>
        <form action={action}>
          <label htmlFor="u">아이디</label>
          <input id="u" name="username" autoComplete="username" required />
          <label htmlFor="p">비밀번호</label>
          <input id="p" name="password" type="password" autoComplete="current-password" required />
          {error && <p className="err">{error}</p>}
          <p><button disabled={pending}>{pending ? "입장 중…" : "입장하기"}</button></p>
        </form>
      </div>
    </div>
  );
}
