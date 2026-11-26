import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EST Virtual Academy",
  description: "개인화 학습공간 기반 온라인 학원 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
