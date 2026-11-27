// 교실(영어관·수학관·국어관·사회관·과학관) 공통 구조의 과목별 설정.
// 선생님의 과제 링크는 환경변수로 넣을 수 있고, 없으면 자습실로 안내한다.
import { roomBySlug } from "./rooms";
import { VOCAB, type VocabItem } from "./vocab";
import { HISTORY_QUIZ, SCIENCE_QUIZ, type QuizItem } from "./quizzes";

export type Look = { hair: string; style: "bun" | "short" | "bob" | "pony"; top: string; coat?: boolean; glasses?: boolean };
export type Poster = "alphabet" | "graph" | "hangul" | "map" | "periodic";
export type BoardStatic = { kind: "static"; label: string; headline: string; sub: string; line: string };
export type DeskLink = { no: number; href: string; tag: string; label: string }; // no번 책상: 앞줄 왼쪽→오른쪽 1~4, 뒷줄 5~8
export type Classroom = {
  slug: string;
  subject: string; // 영어 · 수학 …
  assignment: string; // 선생님이 점수를 묻는 과제 (수업형이면 칠판 숙제 줄에 쓰는 이름)
  check: "score" | "lesson"; // score: 과제 점수를 묻는다 / lesson: 오늘 수업을 들었는지 묻는다
  link: { href: string; label: string; external: boolean };
  board: BoardStatic | { kind: "math" } | { kind: "vocab"; items: VocabItem[] } | { kind: "quiz"; title: string; items: QuizItem[] };
  poster: Poster;
  posterNote: string;
  sticky: [string, string, string];
  look: Look;
  great: number;
  ok: number;
  deskLink?: DeskLink;
};

const EBSI_DEFAULT = "https://www.ebsi.co.kr/ebs/pot/poti/main.ebs";
const fallback = { href: "/rooms/study", label: "자습실로 가기", external: false };
const ext = (url: string | undefined, label: string) => (url ? { href: url, label, external: true } : fallback);

export const CLASSROOMS: Record<string, Classroom> = {
  english: {
    slug: "english", subject: "영어", assignment: "클래스카드", check: "score",
    link: ext(process.env.CLASSCARD_URL || "https://www.classcard.net/", "클래스카드 하러 가기"),
    board: { kind: "static", label: "Today's word", headline: "serendipity", sub: "/ˌserənˈdɪpəti/ · 뜻밖의 행운", line: "Read · Speak · Write" },
    poster: "alphabet", posterNote: "English only!", sticky: ["WORD", "TEST", "D-3"],
    look: { hair: "#5a3a2e", style: "bun", top: "#a9c4a6" }, great: 90, ok: 70,
    deskLink: { no: 1, href: "/files/ebs-2027", tag: "EBS 2027", label: "EBS 연계 영어 지문 학습실 2027" },
  },
  math: {
    slug: "math", subject: "수학", assignment: "수학 과제", check: "score",
    link: ext(process.env.MATH_ASSIGNMENT_URL, "수학 과제 하러 가기"),
    board: { kind: "math" },
    poster: "graph", posterNote: "Think it through!", sticky: ["QUIZ", "TIME", "D-2"],
    look: { hair: "#2b2b33", style: "short", top: "#6f8fc9", glasses: true }, great: 90, ok: 70,
  },
  korean: {
    slug: "korean", subject: "국어", assignment: "국어 과제", check: "score",
    link: ext(process.env.KOREAN_ASSIGNMENT_URL, "국어 과제 하러 가기"),
    board: { kind: "vocab", items: VOCAB },
    poster: "hangul", posterNote: "바르고 고운 말", sticky: ["독후감", "제출", "D-5"],
    look: { hair: "#3b2b2b", style: "bob", top: "#e8a3a0" }, great: 90, ok: 70,
  },
  social: {
    slug: "social", subject: "사회", assignment: "EBSi 수업", check: "lesson",
    link: ext(process.env.EBSI_URL || EBSI_DEFAULT, "EBSi에서 수업 듣기"),
    board: { kind: "quiz", title: "오늘의 한국사 퀴즈", items: HISTORY_QUIZ },
    poster: "map", posterNote: "Think globally", sticky: ["발표", "수업", "D-4"],
    look: { hair: "#6b4a30", style: "pony", top: "#d8b25a" }, great: 90, ok: 70,
  },
  science: {
    slug: "science", subject: "과학", assignment: "EBSi 수업", check: "lesson",
    link: ext(process.env.EBSI_URL || EBSI_DEFAULT, "EBSi에서 수업 듣기"),
    board: { kind: "quiz", title: "오늘의 물화생 퀴즈", items: SCIENCE_QUIZ },
    poster: "periodic", posterNote: "Observe!", sticky: ["실험", "보고서", "D-6"],
    look: { hair: "#2f4b8f", style: "bob", top: "#6aa6a0", coat: true, glasses: true }, great: 90, ok: 70,
  },
};

export const classroomFor = (slug: string) => CLASSROOMS[slug];
export const classroomColor = (slug: string) => roomBySlug(slug)?.color ?? "#7d9cc4";
