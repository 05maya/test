// 도서관 책장 정의. 1번 책장은 외부 서비스(생기부 도서추천)와 연결된다.
export type Shelf = { no: number; title: string; url?: string };

export const SHELVES: Shelf[] = [
  {
    no: 1,
    title: "생기부 도서추천",
    url: process.env.BOOK_RECOMMENDATION_URL || "https://book-recommendation-service.replit.app/",
  },
  {
    no: 2,
    title: "탐구보고서 워크북 제작",
    url: process.env.INQUIRY_WORKBOOK_URL || "https://html-saiteu-gihoeg.replit.app/user-portal",
  },
  { no: 3, title: "준비 중" },
  { no: 4, title: "준비 중" },
];
