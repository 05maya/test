"use client";

import { useEffect, useState } from "react";
import { Arrow, wrapLines } from "./boardKit";
import { FormulaText } from "./MathBoard";
import { QUIZ_ANSWER_MS, QUIZ_QUESTION_MS, type QuizItem } from "@/lib/quizzes";

const CHALK = "'Nanum Pen Script','Gaegu',cursive,system-ui,sans-serif";

export function QuizSlide({ item, revealed }: { item: QuizItem; revealed: boolean }) {
  const lines = wrapLines(item.q, 20).slice(0, 2);
  const tagW = item.tag.length * 13 + 28;
  return (
    <g>
      <rect x={480 - tagW / 2} y={98} width={tagW} height={24} rx={12} fill="#f4b8b0" opacity=".2" />
      <text x={480} y={115} textAnchor="middle" fontSize="14" fill="#f4b8b0" data-board-tag>{item.tag}</text>
      {lines.map((l, i) => (
        <FormulaText key={i} src={l} x={480} y={lines.length === 1 ? 158 : 150 + i * 27} size={22} fill="#ffe08a" />
      ))}
      {revealed ? (
        <FormulaText src={`정답  ▶  ${item.a}`} x={480} y={214} size={item.a.length > 11 ? 21 : 25} fill="#f4b8b0" />
      ) : (
        <text x={480} y={214} textAnchor="middle" fontSize="15" fill="#e6f0e8" opacity=".6" fontFamily="system-ui,sans-serif" data-board-hint>정답은? (칠판을 누르면 바로 공개)</text>
      )}
    </g>
  );
}

/**
 * 퀴즈 칠판: 문제를 먼저 보여 주고 잠시 뒤 정답을 공개한 다음 다음 문제로 넘어간다.
 * 칠판을 누르면 정답이 바로 나오고, 마우스를 올리면 멈춘다.
 */
export default function QuizBoard({ items, title, start = 0, homework }: { items: QuizItem[]; title: string; start?: number; homework: string }) {
  const n = items.length;
  const [idx, setIdx] = useState(((start % n) + n) % n);
  const [revealed, setRevealed] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      if (revealed) { setIdx((i) => (i + 1) % n); setRevealed(false); }
      else setRevealed(true);
    }, revealed ? QUIZ_ANSWER_MS : QUIZ_QUESTION_MS);
    return () => clearTimeout(t);
  }, [paused, revealed, idx, n]);
  const go = (d: number) => { setIdx((i) => (i + d + n) % n); setRevealed(false); };
  const toggle = () => setRevealed((r) => !r);
  return (
    <g data-board="quiz" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <rect x="254" y="70" width="452" height="176" fill="#ffffff" opacity=".001" style={{ cursor: "pointer" }} role="button" tabIndex={0}
        aria-label={revealed ? "정답 숨기기" : "정답 보기"} aria-pressed={revealed} data-board-toggle onClick={toggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }} />
      <text x="480" y="90" textAnchor="middle" fontSize="14" fill="#e6f0e8" opacity=".8" fontFamily="system-ui,sans-serif" style={{ pointerEvents: "none" }}>{title}</text>
      <g key={`${idx}-${revealed}`} className="hall-fade" data-board-slide style={{ pointerEvents: "none" }}><QuizSlide item={items[idx]} revealed={revealed} /></g>
      <text x="480" y="238" textAnchor="middle" fontSize="13" fill="#cfe8dc" opacity=".85" fontFamily={CHALK} style={{ pointerEvents: "none" }}>{homework}</text>
      <text x="694" y="238" textAnchor="end" fontSize="11" fill="#e6f0e8" opacity=".6" data-board-count style={{ pointerEvents: "none" }}>{idx + 1} / {n}</text>
      <Arrow x={274} label="이전 문제" dir="prev" onClick={() => go(-1)} />
      <Arrow x={686} label="다음 문제" dir="next" onClick={() => go(1)} />
    </g>
  );
}
