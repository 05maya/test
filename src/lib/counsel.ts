// 상담실 A4 파일 4개. 4번 파일은 진로 로드맵과 연결된다.
export type CounselFile = { no: number; title: string; url?: string };

export const COUNSEL_FILES: CounselFile[] = [
  { no: 1, title: "준비 중" },
  { no: 2, title: "준비 중" },
  { no: 3, title: "준비 중" },
  {
    no: 4,
    title: "진로 로드맵",
    url: process.env.CAREER_ROADMAP_URL || "https://jolly-croissant-c0be94.netlify.app",
  },
];
