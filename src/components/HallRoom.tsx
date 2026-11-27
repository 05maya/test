"use client";

import { useEffect, useState } from "react";
import { HALL_ROTATE_MS, type HallEntry } from "@/lib/hall";

/** 명단을 일정 간격으로 돌린다. 같은 시점에 마운트된 보드는 서로 어긋나지 않는다. */
function useRotation(n: number, offset = 0) {
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || n < 2) return;
    const id = setInterval(() => setTick((t) => t + 1), HALL_ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, n]);
  return { idx: (((tick + offset) % n) + n) % n, setTick, setPaused, n };
}

function Dots({ cx, y, n, idx, onPick }: { cx: number; y: number; n: number; idx: number; onPick?: (i: number) => void }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} data-hall-dot={i} cx={cx + (i - (n - 1) / 2) * 12} cy={y} r={3} fill={i === idx ? "#ffe08a" : "#ffffff55"}
          onClick={onPick ? () => onPick(i) : undefined} style={onPick ? { cursor: "pointer" } : undefined} />
      ))}
    </g>
  );
}

/** 로비 3층 진열장 자리에 들어가는 회전 현판. */
export function HallPlaque({ cx, floorY, entries, offset = 0 }: { cx: number; floorY: number; entries: HallEntry[]; offset?: number }) {
  const { idx, setPaused } = useRotation(entries.length, offset);
  const e = entries[idx];
  const top = floorY - 142;
  return (
    <g data-hall-board data-hall-offset={offset} role="img" aria-label={`명예의 전당: ${e.kicker} ${e.headline} ${e.name}`}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <rect x={cx - 52} y={top} width="104" height="142" rx="6" fill="#6b4a30" />
      <rect x={cx - 44} y={top + 8} width="88" height="126" fill="#4a2f45" />
      <rect x={cx - 40} y={top + 12} width="80" height="118" fill="none" stroke="#e8c14a" strokeWidth="1.5" opacity=".6" />
      <path d={`M${cx} ${top + 22}l4 8 9 1-6.5 6 1.5 9-8-4.5-8 4.5 1.5-9-6.5-6 9-1z`} fill="#fff1b0" />
      <g key={idx} className="hall-fade">
        <text data-hall-field="kicker" x={cx} y={top + 68} textAnchor="middle" fontSize={e.kicker.length > 6 ? 10 : 12} fill="#f2e6c4">{e.kicker}</text>
        <text data-hall-field="headline" x={cx} y={top + 92} textAnchor="middle" fontSize="22" fontWeight="800" fill="#ffe08a">{e.headline}</text>
        <text data-hall-field="name" x={cx} y={top + 114} textAnchor="middle" fontSize="17" fontWeight="800" fill="#ffffff">{e.name}</text>
      </g>
      <Dots cx={cx} y={top + 126} n={entries.length} idx={idx} />
    </g>
  );
}

function Laurel({ cx, cy, R }: { cx: number; cy: number; R: number }) {
  const ts = [22, 44, 66, 88, 110, 132, 154];
  return (
    <g>
      {ts.map((t) => {
        const r = (t * Math.PI) / 180;
        const dx = R * Math.sin(r), dy = -R * Math.cos(r);
        return (
          <g key={t}>
            <ellipse cx={cx - dx} cy={cy + dy} rx={R * 0.11} ry={R * 0.24} fill="#e8c14a" opacity=".95" transform={`rotate(${90 - t} ${cx - dx} ${cy + dy})`} />
            <ellipse cx={cx + dx} cy={cy + dy} rx={R * 0.11} ry={R * 0.24} fill="#e8c14a" opacity=".95" transform={`rotate(${-(90 - t)} ${cx + dx} ${cy + dy})`} />
          </g>
        );
      })}
      <path d={`M${cx - 20} ${cy + R + 8}Q${cx} ${cy + R + 20} ${cx + 20} ${cy + R + 8}`} stroke="#d8a932" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Trophy({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">
      <path d="M-16 -36H16V-20C16-6 6 2 0 2C-6 2-16-6-16-20Z" fill="#e8c14a" />
      <path d="M-16-32H-25C-25-18-21-14-15-14M16-32H25C25-18 21-14 15-14" stroke="#d8a932" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="-3" y="2" width="6" height="10" fill="#d8a932" />
      <rect x="-13" y="12" width="26" height="7" rx="2" fill="#b4812a" />
      <path d="M-9-30V-22" stroke="#fff6c8" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Cabinet({ x }: { x: number }) {
  return (
    <g aria-hidden="true">
      <rect x={x} y={120} width="150" height="230" rx="8" fill="#6b4a30" />
      <rect x={x + 10} y={130} width="130" height="210" fill="#4a2f45" />
      {[196, 262].map((y) => <rect key={y} x={x + 10} y={y} width="130" height="6" fill="#b88a5b" />)}
      <Trophy x={x + 75} y={186} s={1.2} />
      <Trophy x={x + 42} y={252} s={0.85} /><Trophy x={x + 108} y={252} s={0.85} />
      <Trophy x={x + 75} y={332} s={0.85} />
      <polygon points={`${x + 10},130 ${x + 60},130 ${x + 10},230`} fill="#fff" opacity=".12" />
    </g>
  );
}

function Pedestal({ x }: { x: number }) {
  return (
    <g aria-hidden="true">
      <ellipse cx={x} cy={506} rx="52" ry="9" fill="#0003" />
      <rect x={x - 38} y={452} width="76" height="54" rx="4" fill="#f2ead8" />
      <rect x={x - 44} y={444} width="88" height="12" rx="3" fill="#fffaf0" />
      <Trophy x={x} y={415} s={1.5} />
    </g>
  );
}

export default function HallRoom({ entries }: { entries: HallEntry[] }) {
  const { idx, setTick, setPaused, n } = useRotation(entries.length);
  const e = entries[idx];
  return (
    <svg className="scene" viewBox="0 0 960 540" role="group" aria-label="명예의 전당: 가운데 큰 액자에 수상·합격 학생이 돌아가며 나타납니다."
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <defs>
        <linearGradient id="h-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4468" /><stop offset="1" stopColor="#2b3354" /></linearGradient>
        <linearGradient id="h-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9e1d0" /><stop offset="1" stopColor="#cfc5ae" /></linearGradient>
        <linearGradient id="h-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3c2" stopOpacity=".5" /><stop offset="1" stopColor="#fff3c2" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#h-wall)" />
      <rect y="360" width="960" height="46" fill="#5b3a2e" />
      <rect y="356" width="960" height="6" fill="#e8c14a" />
      <rect y="406" width="960" height="134" fill="url(#h-floor)" />
      {[0, 1, 2].map((i) => <line key={i} x1="0" x2="960" y1={438 + i * 36} y2={438 + i * 36} stroke="#0000001a" />)}
      <polygon points="400,540 560,540 520,406 440,406" fill="#a8404c" />
      <polygon points="410,540 550,540 515,406 445,406" fill="none" stroke="#e8c14a" strokeWidth="2" strokeDasharray="6 5" />

      <Cabinet x={50} /><Cabinet x={760} />

      {/* 가운데 회전 액자 */}
      <polygon points="460,34 500,34 640,356 320,356" fill="url(#h-beam)" />
      <rect x="456" y="24" width="48" height="14" rx="5" fill="#1c2236" />
      <g data-hall-board data-hall-offset="0" role="img" aria-label={`${e.kicker} ${e.headline} ${e.name}`}>
        <rect x="300" y="52" width="360" height="282" rx="10" fill="#d8b25a" />
        <rect x="312" y="64" width="336" height="258" rx="4" fill="#4a2f45" />
        <rect x="322" y="74" width="316" height="238" fill="none" stroke="#e8c14a" strokeWidth="1.5" opacity=".6" />
        <Laurel cx={480} cy={182} R={50} />
        <g key={idx} className="hall-fade">
          <text data-hall-field="kicker" x={480} y={106} textAnchor="middle" fontSize="20" fill="#f2e6c4" letterSpacing="1">{e.kicker}</text>
          <text data-hall-field="headline" x={480} y={196} textAnchor="middle" fontSize="40" fontWeight="800" fill="#ffe08a">{e.headline}</text>
          <text data-hall-field="name" x={480} y={294} textAnchor="middle" fontSize="36" fontWeight="800" fill="#ffffff" letterSpacing="2">{e.name}</text>
        </g>
        <Dots cx={480} y={311} n={n} idx={idx} onPick={(i) => setTick((t) => t + (i - idx))} />
      </g>
      <rect x="400" y="340" width="160" height="26" rx="7" fill="#d8b25a" />
      <text x="480" y="358" textAnchor="middle" fontSize="14" fontWeight="700" fill="#3b2a0e">🏆 명예의 전당</text>

      <Pedestal x={70} /><Pedestal x={890} />
    </svg>
  );
}
