import Link from "next/link";
import { logout } from "@/app/actions";
import { ROLE_LABEL, type SessionUser } from "@/lib/auth";

export default function Header({ user }: { user: SessionUser }) {
  return (
    <header className="top">
      <Link href="/" className="brand">🏫 EST Virtual Academy</Link>
      <nav>
        <Link href="/">로비</Link>
        {user.role === "ADMIN" && <Link href="/admin">관리자</Link>}
        <span className="muted">
          {user.name} ({ROLE_LABEL[user.role]})
        </span>
        <form action={logout}><button className="ghost">로그아웃</button></form>
      </nav>
    </header>
  );
}
