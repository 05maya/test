// 면접실 책상 위 파일 3개. 링크는 아직 연결되지 않았다(이름만).
export type InterviewFile = { no: number; title: string; url?: string };

export const INTERVIEW_FILES: InterviewFile[] = [
  { no: 1, title: "교과면접" },
  { no: 2, title: "생기부면접" },
  { no: 3, title: "준비 중" },
];
