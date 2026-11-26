export type Room = {
  slug: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
  // 지도(SVG)에서의 위치
  x: number;
  y: number;
  w: number;
  h: number;
  access?: ("STUDENT" | "PARENT" | "TEACHER" | "ADMIN")[];
};

export const ROOMS: Room[] = [
  { slug: "english", name: "영어관", icon: "🔤", desc: "영어 학습자료 및 시험 대비", color: "#7aa7e8", x: 30, y: 30, w: 170, h: 120, access: ["STUDENT", "TEACHER", "ADMIN"] },
  { slug: "math", name: "수학관", icon: "📐", desc: "수학 학습자료", color: "#f2a65a", x: 215, y: 30, w: 170, h: 120, access: ["STUDENT", "TEACHER", "ADMIN"] },
  { slug: "korean", name: "국어관", icon: "📖", desc: "독서자료 및 생기부 도서추천", color: "#e57f84", x: 400, y: 30, w: 170, h: 120, access: ["STUDENT", "TEACHER", "ADMIN"] },
  { slug: "social", name: "사회관", icon: "🌏", desc: "사회 학습자료 및 탐구활동", color: "#8bc48a", x: 585, y: 30, w: 170, h: 120, access: ["STUDENT", "TEACHER", "ADMIN"] },
  { slug: "science", name: "과학관", icon: "🔬", desc: "과학 학습자료 및 탐구보고서 제작", color: "#6cc5c0", x: 30, y: 165, w: 170, h: 120, access: ["STUDENT", "TEACHER", "ADMIN"] },
  { slug: "study", name: "자습실", icon: "🪑", desc: "자기주도학습 계획 · 인생게임 플래너", color: "#b79ae0", x: 215, y: 165, w: 170, h: 120, access: ["STUDENT", "TEACHER", "ADMIN"] },
  { slug: "interview", name: "면접실", icon: "🎤", desc: "대학별 면접자료 및 면접 준비", color: "#d9b44a", x: 400, y: 165, w: 170, h: 120, access: ["STUDENT", "TEACHER", "ADMIN"] },
  { slug: "counsel", name: "상담실", icon: "💬", desc: "학습·진로 상담 및 상담 신청", color: "#e88fc0", x: 585, y: 165, w: 170, h: 120 },
  { slug: "parents", name: "학부모대기실", icon: "🛋️", desc: "공지, 자녀 학습현황, 상담", color: "#a0a8b8", x: 215, y: 300, w: 355, h: 90, access: ["PARENT", "TEACHER", "ADMIN"] },
];

export const roomBySlug = (slug: string) => ROOMS.find((r) => r.slug === slug);

export const canEnter = (room: Room, role: string) =>
  !room.access || (room.access as string[]).includes(role);
