import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canEnter, roomBySlug } from "@/lib/rooms";
import Header from "@/components/Header";
import SubjectInterviewRoom from "@/components/SubjectInterviewRoom";

export default async function SubjectInterviewPage() {
  const user = await requireUser();
  const room = roomBySlug("interview")!;
  if (!canEnter(room, user.role)) redirect("/");
  return (
    <>
      <Header user={user} />
      <main className="wrap">
        <p><Link href="/rooms/interview">← 면접실로</Link></p>
        <SubjectInterviewRoom />
        <h1>🎤 교과면접</h1>
        <p className="muted">면접위원이 지원 학교와 학과를 묻습니다.</p>
      </main>
    </>
  );
}
