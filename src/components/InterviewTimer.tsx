"use client";

import { useEffect, useState } from "react";

const PRESETS = [1, 2, 3];

function Chip({ x, y, w, label, active, onClick, aria, id }: { x: number; y: number; w: number; label: string; active?: boolean; onClick: () => void; aria: string; id: string }) {
  return (
    <g
      role="button" tabIndex={0} aria-label={aria} aria-pressed={active} data-timer-btn={id} className="tbtn"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
    >
      <rect x={x} y={y} width={w} height={24} rx={12} fill={active ? "#ffb44a" : "#2b3552"} stroke="#ffb44a" strokeWidth="1.5" />
      <text x={x + w / 2} y={y + 16.5} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={active ? "#1c2236" : "#ffd9a0"}>{label}</text>
    </g>
  );
}

/** 면접 타이머 (1·2·3분). compact는 면접실 안쪽 방의 벽 위쪽 얇은 띠 형태. */
export default function InterviewTimer({ compact = false }: { compact?: boolean }) {
  const [minutes, setMinutes] = useState(3);
  const [left, setLeft] = useState(180);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) { setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const pick = (m: number) => { setMinutes(m); setLeft(m * 60); setRunning(false); };
  const toggle = () => { if (left === 0) setLeft(minutes * 60); setRunning((r) => !r); };
  const reset = () => { setLeft(minutes * 60); setRunning(false); };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const warn = left <= 60;
  const done = left === 0;
  if (compact) {
    return (
      <g>
        <rect x="300" y="8" width="360" height="52" rx="12" fill="#1c2236" stroke="#8a6a43" strokeWidth="4" />
        <text x="372" y="23" textAnchor="middle" fontSize="9" fontWeight="700" fill="#8f9bbd" letterSpacing="2">{done ? "TIME UP" : running ? "INTERVIEW" : "READY"}</text>
        <text x="372" y="50" textAnchor="middle" fontSize="30" fontWeight="700" fill={warn ? "#ff6b5e" : "#ffb44a"} fontFamily="ui-monospace,Menlo,Consolas,monospace" data-timer-display role="timer" aria-label={`남은 시간 ${mm}분 ${ss}초`}>{mm}:{ss}</text>
        {PRESETS.map((m, i) => (
          <Chip key={m} id={String(m)} x={450 + i * 40} y={22} w={36} label={`${m}분`} active={minutes === m} onClick={() => pick(m)} aria={`${m}분으로 설정`} />
        ))}
        <Chip id="toggle" x={574} y={22} w={30} label={running ? "⏸" : "▶"} onClick={toggle} aria={running ? "일시정지" : "시작"} />
        <Chip id="reset" x={608} y={22} w={28} label="↺" onClick={reset} aria="처음 시간으로 되돌리기" />
      </g>
    );
  }
  return (
    <g>
      <rect x="370" y="24" width="220" height="118" rx="14" fill="#1c2236" stroke="#8a6a43" strokeWidth="5" />
      <text x="480" y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8f9bbd" letterSpacing="2">{done ? "TIME UP" : running ? "INTERVIEW" : "READY"}</text>
      <text x="480" y="92" textAnchor="middle" fontSize="46" fontWeight="700" fill={warn ? "#ff6b5e" : "#ffb44a"} fontFamily="ui-monospace,Menlo,Consolas,monospace" data-timer-display role="timer" aria-label={`남은 시간 ${mm}분 ${ss}초`}>{mm}:{ss}</text>
      {PRESETS.map((m, i) => (
        <Chip key={m} id={String(m)} x={382 + i * 46} y={104} w={40} label={`${m}분`} active={minutes === m} onClick={() => pick(m)} aria={`${m}분으로 설정`} />
      ))}
      <Chip id="toggle" x={522} y={104} w={30} label={running ? "⏸" : "▶"} onClick={toggle} aria={running ? "일시정지" : "시작"} />
      <Chip id="reset" x={556} y={104} w={28} label="↺" onClick={reset} aria="처음 시간으로 되돌리기" />
    </g>
  );
}
