import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import Header from "@/components/Header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <>
      <Header user={user} />
      <main className="wrap">
        <h1>관리자</h1>
        <p style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn ghost" href="/admin/users">사용자</Link>
          <Link className="btn ghost" href="/admin/resources">학습자료</Link>
          <Link className="btn ghost" href="/admin/notices">공지사항</Link>
          <Link className="btn ghost" href="/admin/consultations">상담</Link>
        </p>
        {children}
      </main>
    </>
  );
}
