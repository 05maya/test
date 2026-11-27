import { readFile } from "node:fs/promises";
import path from "node:path";
import { getUser } from "@/lib/auth";
import { canEnter, roomBySlug } from "@/lib/rooms";

export const dynamic = "force-dynamic";

// 영어관 1번 책상: "EBS 연계 영어 지문 학습실 2027" (파일 하나로 된 정적 HTML).
// 로그인한 사용자 중 영어관에 들어갈 수 있는 역할만 볼 수 있다.
const CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'", // 파일 안의 인라인 스크립트만 허용
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src data:",
  "connect-src 'none'", // 이 파일은 서버와 통신하지 않는다
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'self'",
].join("; ");

export async function GET() {
  const user = await getUser();
  if (!user) return new Response(null, { status: 302, headers: { Location: "/login" } });
  if (!canEnter(roomBySlug("english")!, user.role)) return new Response("접근 권한이 없습니다.", { status: 403 });

  const html = await readFile(path.join(process.cwd(), "private", "ebs-2027.html"));
  return new Response(new Uint8Array(html), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=600",
      "Content-Security-Policy": CSP,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
