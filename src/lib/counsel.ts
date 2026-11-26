// 상담실 A4 파일 4개. 4번 파일만 링크가 연결되어 있고, 1~3번은 이름만 달려 있다.
export type CounselFile = { no: number; title: string; url?: string };

export const COUNSEL_FILES: CounselFile[] = [
  { no: 1, title: "U&I 검사" },
  { no: 2, title: "진로적성검사" },
  { no: 3, title: "지문검사" },
  {
    no: 4,
    title: "진로 로드맵",
    url: process.env.CAREER_ROADMAP_URL || "https://jolly-croissant-c0be94.netlify.app",
  },
];
