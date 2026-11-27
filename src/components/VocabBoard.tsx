"use client";

import { useEffect, useState } from "react";
import { Arrow, wrapLines } from "./boardKit";
import { MATH_ROTATE_MS } from "@/lib/math";
import type { VocabItem } from "@/lib/vocab";

const CHALK = "'Nanum Pen Script','Gaegu',cursive,system-ui,sans-serif";

export function VocabSlide({ item }: { item: VocabItem }) {
  const lines = wrapLines(item.meaning, 22).slice(0, 3);
  const tagW = item.hanja.length * 18 + 30;
  return (
    <g>
      <rect x={480 - tagW / 2} y={100} width={tagW} height={24} rx={12} fill="#f4b8b0" opacity=".2" />
      <text x={480} y={118} textAnchor="middle" fontSize="15" fill="#f4b8b0" data-board-tag>{item.hanja}</text>
      <text x={480} y={166} textAnchor="middle" fontSize="48" fontWeight="700" fill="#ffe08a" fontFamily={CHALK} data-board-main>{item.word}</text>
      {lines.map((l, i) => (
        <text key={i} x={480} y={192 + i * 22} textAnchor="middle" fontSize="19" fill="#e6f0e8" fontFamily={CHALK} data-board-sub>{l}</text>
      ))}
    </g>
  );
}

/** 국어관 칠판: 어려운 어휘 풀이가 돌아가며 나온다. */
export default function VocabBoard({ items, start = 0, homework }: { items: VocabItem[]; start?: number; homework: string }) {
  const n = items.length;
  const [idx, setIdx] = useState(((start % n) + n) % n);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), MATH_ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, n]);
  const go = (d: number) => setIdx((i) => (i + d + n) % n);
  return (
    <g data-board="vocab" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <text x="480" y="90" textAnchor="middle" fontSize="14" fill="#e6f0e8" opacity=".8" fontFamily="system-ui,sans-serif">오늘의 어휘</text>
      <g key={idx} className="hall-fade" data-board-slide><VocabSlide item={items[idx]} /></g>
      <text x="480" y="238" textAnchor="middle" fontSize="13" fill="#cfe8dc" opacity=".85" fontFamily={CHALK}>{homework}</text>
      <text x="694" y="238" textAnchor="end" fontSize="11" fill="#e6f0e8" opacity=".6" data-board-count>{idx + 1} / {n}</text>
      <Arrow x={274} label="이전 어휘" dir="prev" onClick={() => go(-1)} />
      <Arrow x={686} label="다음 어휘" dir="next" onClick={() => go(1)} />
    </g>
  );
}
