// 교실(영어관·수학관·국어관·사회관·과학관) 공통 구조의 과목별 설정.
// 선생님의 과제 링크는 환경변수로 넣을 수 있고, 없으면 자습실로 안내한다.
import { roomBySlug } from "./rooms";

export type Look = { hair: string; style: "bun" | "short" | "bob" | "pony"; top: string; coat?: boolean; glasses?: boolean };
export type Poster = "alphabet" | "graph" | "hangul" | "map" | "periodic";
export type BoardStatic = { kind: "static"; label: string; headline: string; sub: string; line: string };
export type Classroom = {
  slug: string;
  subject: string; // 영어 · 수학 …
  assignment: string; // 선생님이 점수를 묻는 과제
  link: { href: string; label: string; external: boolean };
  board: BoardStatic | { kind: "math" };
  poster: Poster;
  posterNote: string;
  sticky: [string, string, string];
  look: Look;
  great: number;
  ok: number;
};

const fallback = { href: "/rooms/study", label: "자습실로 가기", external: false };
const ext = (url: string | undefined, label: string) => (url ? { href: url, label, external: true } : fallback);

export const CLASSROOMS: Record<string, Classroom> = {
  english: {
    slug: "english", subject: "영어", assignment: "클래스카드",
    link: ext(process.env.CLASSCARD_URL || "https://www.classcard.net/", "클래스카드 하러 가기"),
    board: { kind: "static", label: "Today's word", headline: "serendipity", sub: "/ˌserənˈdɪpəti/ · 뜻밖의 행운", line: "Read · Speak · Write" },
    poster: "alphabet", posterNote: "English only!", sticky: ["WORD", "TEST", "D-3"],
    look: { hair: "#5a3a2e", style: "bun", top: "#a9c4a6" }, great: 90, ok: 70,
  },
  math: {
    slug: "math", subject: "수학", assignment: "수학 과제",
    link: ext(process.env.MATH_ASSIGNMENT_URL, "수학 과제 하러 가기"),
    board: { kind: "math" },
    poster: "graph", posterNote: "Think it through!", sticky: ["QUIZ", "TIME", "D-2"],
    look: { hair: "#2b2b33", style: "short", top: "#6f8fc9", glasses: true }, great: 90, ok: 70,
  },
  korean: {
    slug: "korean", subject: "국어", assignment: "국어 과제",
    link: ext(process.env.KOREAN_ASSIGNMENT_URL, "국어 과제 하러 가기"),
    board: { kind: "static", label: "오늘의 낱말", headline: "사려 깊다", sub: "생각이 깊고 신중하다", line: "읽고 · 쓰고 · 말하기" },
    poster: "hangul", posterNote: "바르고 고운 말", sticky: ["독후감", "제출", "D-5"],
    look: { hair: "#3b2b2b", style: "bob", top: "#e8a3a0" }, great: 90, ok: 70,
  },
  social: {
    slug: "social", subject: "사회", assignment: "사회 과제",
    link: ext(process.env.SOCIAL_ASSIGNMENT_URL, "사회 과제 하러 가기"),
    board: { kind: "static", label: "오늘의 키워드", headline: "민주주의", sub: "국민이 주인인 정치 체제", line: "알고 · 비교하고 · 토론하기" },
    poster: "map", posterNote: "Think globally", sticky: ["발표", "수업", "D-4"],
    look: { hair: "#6b4a30", style: "pony", top: "#d8b25a" }, great: 90, ok: 70,
  },
  science: {
    slug: "science", subject: "과학", assignment: "과학 과제",
    link: ext(process.env.SCIENCE_ASSIGNMENT_URL, "과학 과제 하러 가기"),
    board: { kind: "static", label: "오늘의 법칙", headline: "F = ma", sub: "힘 = 질량 × 가속도", line: "관찰 · 가설 · 실험" },
    poster: "periodic", posterNote: "Observe!", sticky: ["실험", "보고서", "D-6"],
    look: { hair: "#2f4b8f", style: "bob", top: "#6aa6a0", coat: true, glasses: true }, great: 90, ok: 70,
  },
};

export const classroomFor = (slug: string) => CLASSROOMS[slug];
export const classroomColor = (slug: string) => roomBySlug(slug)?.color ?? "#7d9cc4";
