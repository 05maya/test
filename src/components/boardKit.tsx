"use client";

import { formulaWidth } from "@/lib/math";

/** 칠판 좌우의 이전/다음 버튼. */
export function Arrow({ x, label, dir, onClick }: { x: number; label: string; dir: "prev" | "next"; onClick: () => void }) {
  return (
    <g role="button" tabIndex={0} aria-label={label} data-board-nav={dir} data-math-nav={dir} className="tbtn"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onClick(); } }}>
      <rect x={x - 14} y={134} width={28} height={50} rx={8} fill="#ffffff" opacity=".001" />
      <text x={x} y={170} textAnchor="middle" fontSize="34" fill="#e6f0e8" opacity=".55">{dir === "prev" ? "‹" : "›"}</text>
    </g>
  );
}

/** 공백 기준으로 줄을 나눈다 (한 줄 최대 max자, 수식 첨자는 0.6자로 계산). */
export function wrapLines(s: string, max: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && formulaWidth(next) > max) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
