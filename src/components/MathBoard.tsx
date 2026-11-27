"use client";

import { useEffect, useState } from "react";
import { Arrow } from "./boardKit";
import { MATH_FORMULAS, MATH_ROTATE_MS, formulaWidth, parseFormula, type MathFormula } from "@/lib/math";

/** 칠판용 SVG 수식. ^ 위첨자 · _ 아래첨자를 tspan으로 그린다. */
export function FormulaText({ src, x, y, size, fill }: { src: string; x: number; y: number; size: number; fill: string }) {
  let pending = 0;
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="700" fill={fill} fontFamily="'Nanum Pen Script','Gaegu',cursive,system-ui,sans-serif" data-math-formula>
      {parseFormula(src).map((s, i) => {
        if (s.k === "sup") {
          const dy = -size * 0.42 + pending;
          pending = size * 0.42;
          return <tspan key={i} fontSize={size * 0.62} dy={dy}>{s.t}</tspan>;
        }
        if (s.k === "sub") {
          const dy = size * 0.18 + pending;
          pending = -size * 0.18;
          return <tspan key={i} fontSize={size * 0.62} dy={dy}>{s.t}</tspan>;
        }
        const dy = pending;
        pending = 0;
        return <tspan key={i} {...(dy ? { dy } : {})}>{s.t}</tspan>;
      })}
    </text>
  );
}

export function formulaSize(f: string) {
  const w = formulaWidth(f);
  return w > 30 ? 25 : w > 22 ? 30 : w > 14 ? 38 : 46;
}

export function MathSlide({ item }: { item: MathFormula }) {
  const tagW = item.tag.length * 13 + 28;
  return (
    <g>
      <rect x={480 - tagW / 2} y={102} width={tagW} height={24} rx={12} fill="#f4b8b0" opacity=".2" />
      <text x={480} y={119} textAnchor="middle" fontSize="14" fill="#f4b8b0" data-math-tag>{item.tag}</text>
      <FormulaText src={item.f} x={480} y={176} size={formulaSize(item.f)} fill="#ffe08a" />
    </g>
  );
}

/** 수학관 칠판: 공식이 일정 간격으로 돌아가며 나온다. 마우스를 올리면 멈춘다. */
export default function MathBoard({ start = 0, homework }: { start?: number; homework: string }) {
  const n = MATH_FORMULAS.length;
  const [idx, setIdx] = useState(((start % n) + n) % n);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), MATH_ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, n]);
  const go = (d: number) => setIdx((i) => (i + d + n) % n);
  return (
    <g data-math-board onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <text x="480" y="92" textAnchor="middle" fontSize="14" fill="#e6f0e8" opacity=".8" fontFamily="system-ui,sans-serif">오늘의 공식</text>
      <g key={idx} className="hall-fade" data-math-slide><MathSlide item={MATH_FORMULAS[idx]} /></g>
      <line x1="290" y1="198" x2="670" y2="198" stroke="#e6f0e8" strokeDasharray="4 5" opacity=".45" />
      <text x="480" y="226" textAnchor="middle" fontSize="16" fill="#cfe8dc" fontFamily="'Nanum Pen Script','Gaegu',cursive,system-ui,sans-serif">{homework}</text>
      <text x="694" y="238" textAnchor="end" fontSize="11" fill="#e6f0e8" opacity=".6" data-math-count>{idx + 1} / {n}</text>
      <Arrow x={274} label="이전 공식" dir="prev" onClick={() => go(-1)} />
      <Arrow x={686} label="다음 공식" dir="next" onClick={() => go(1)} />
    </g>
  );
}
