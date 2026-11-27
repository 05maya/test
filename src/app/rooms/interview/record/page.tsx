import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canEnter, roomBySlug } from "@/lib/rooms";
import Header from "@/components/Header";
import InterviewApplication from "@/components/InterviewApplication";

export default async function RecordInterviewPage() {
  const user = await requireUser();
  const room = roomBySlug("interview")!;
  if (!canEnter(room, user.role)) redirect("/");
  return (
    <>
      <Header user={user} />
      <main className="wrap">
        <p><Link href="/rooms/interview">← 면접실로</Link></p>
        <InterviewApplication kind="record" />
        <h1>🎤 생기부면접</h1>
        <p className="muted">면접위원이 지원 학교와 학과를 묻고, 생기부를 살펴봅니다.</p>
      </main>
    </>
  );
}
