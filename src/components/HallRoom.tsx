import type { HallSection } from "@/lib/hall";

const CX = [190, 480, 770];

function Laurel({ cx, cy }: { cx: number; cy: number }) {
  const R = 54;
  const ts = [22, 44, 66, 88, 110, 132, 154];
  return (
    <g>
      {ts.map((t) => {
        const r = (t * Math.PI) / 180;
        const dx = R * Math.sin(r), dy = -R * Math.cos(r);
        return (
          <g key={t}>
            <ellipse cx={cx - dx} cy={cy + dy} rx="6" ry="13" fill="#e8c14a" opacity=".95" transform={`rotate(${90 - t} ${cx - dx} ${cy + dy})`} />
            <ellipse cx={cx + dx} cy={cy + dy} rx="6" ry="13" fill="#e8c14a" opacity=".95" transform={`rotate(${-(90 - t)} ${cx + dx} ${cy + dy})`} />
          </g>
        );
      })}
      <path d={`M${cx - 18} ${cy + R + 6}Q${cx} ${cy + R + 16} ${cx + 18} ${cy + R + 6}`} stroke="#d8a932" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d={`M${cx} ${cy - 26}l8 16 18 2-13 12 3 18-16-9-16 9 3-18-13-12 18-2z`} fill="#fff1b0" stroke="#e8c14a" strokeWidth="2" strokeLinejoin="round" />
    </g>
  );
}

function Pedestal({ x }: { x: number }) {
  return (
    <g aria-hidden="true">
      <ellipse cx={x} cy={506} rx="52" ry="9" fill="#0003" />
      <rect x={x - 38} y={452} width="76" height="54" rx="4" fill="#f2ead8" />
      <rect x={x - 44} y={444} width="88" height="12" rx="3" fill="#fffaf0" />
      <g transform={`translate(${x} 415) scale(1.5)`}>
        <path d="M-16 -36H16V-20C16-6 6 2 0 2C-6 2-16-6-16-20Z" fill="#e8c14a" />
        <path d="M-16-32H-25C-25-18-21-14-15-14M16-32H25C25-18 21-14 15-14" stroke="#d8a932" strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="-3" y="2" width="6" height="10" fill="#d8a932" />
        <rect x="-13" y="12" width="26" height="7" rx="2" fill="#b4812a" />
        <path d="M-9-30V-22" stroke="#fff6c8" strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  );
}

export default function HallRoom({ sections }: { sections: HallSection[] }) {
  return (
    <svg className="scene" viewBox="0 0 960 540" role="img" aria-label="명예의 전당: 이달의 명예, 합격, 성적 향상 세 개의 전시 액자와 트로피 받침대가 있는 갤러리">
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

      {/* 스포트라이트 + 액자 */}
      {sections.map((s, i) => {
        const cx = CX[i];
        return (
          <g key={s.no}>
            <polygon points={`${cx - 18},34 ${cx + 18},34 ${cx + 120},360 ${cx - 120},360`} fill="url(#h-beam)" />
            <rect x={cx - 24} y={24} width="48" height="14" rx="5" fill="#1c2236" />
            <rect x={cx - 108} y={64} width="216" height="262" rx="8" fill="#d8b25a" />
            <rect x={cx - 98} y={74} width="196" height="242" rx="4" fill="#4a2f45" />
            <rect x={cx - 90} y={82} width="180" height="226" fill="none" stroke="#e8c14a" strokeWidth="1.5" opacity=".6" />
            <Laurel cx={cx} cy={176} />
            <text x={cx} y={284} textAnchor="middle" fontSize="13" fill="#f2e6c4" opacity=".85">첫 번째 주인공을</text>
            <text x={cx} y={302} textAnchor="middle" fontSize="13" fill="#f2e6c4" opacity=".85">기다리고 있어요</text>
            <rect x={cx - 80} y={332} width="160" height="26" rx="7" fill="#d8b25a" />
            <circle cx={cx - 62} cy={345} r="10" fill="#7a5a1e" />
            <text x={cx - 62} y={350} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">{s.no}</text>
            <text x={cx - 46} y={350} fontSize="14" fontWeight="700" fill="#3b2a0e">{s.title}</text>
          </g>
        );
      })}

      <Pedestal x={70} /><Pedestal x={890} />
    </svg>
  );
}
