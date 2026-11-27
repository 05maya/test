import Books from "./Books";

const SEATS = 5;
const W = 150, STEP = 178, X0 = 49;

function Seat({ i, url }: { i: number; url?: string }) {
  const live = !!url;
  const x = X0 + i * STEP;
  const cx = x + W / 2;
  return (
    <g>
      <rect className="shelf-glow" x={x - 10} y={78} width={W + 20} height={380} rx={14} fill="#ffe08a" opacity="0" />
      {/* 칸막이 책상 본체 */}
      <rect x={x} y={118} width={W} height={302} rx={8} fill="#d9cdb8" />
      <polygon points={`${x},118 ${x + 14},134 ${x + 14},322 ${x},338`} fill="#b9a88a" />
      <polygon points={`${x + W},118 ${x + W - 14},134 ${x + W - 14},322 ${x + W},338`} fill="#b9a88a" />
      <rect x={x + 14} y={134} width={W - 28} height={188} fill="#eaeff7" />
      <rect x={x + 14} y={134} width={W - 28} height={10} fill="#0000000d" />
      {/* 선반 + 책 + 메모 */}
      <rect x={x + 14} y={210} width={W - 28} height={6} fill="#b88a5b" />
      <Books baseY={210} x0={x + 18} x1={x + 78} seed={i * 13 + 5} hMax={46} />
      <rect x={x + 92} y={150} width={30} height={28} fill="#f6e08a" transform={`rotate(-4 ${x + 107} 164)`} />
      <rect x={x + 100} y={160} width={26} height={22} fill="#f4b8b0" transform={`rotate(5 ${x + 113} 171)`} />
      <path d={`M${x + 97} 160h20M${x + 97} 166h14`} stroke="#0000003a" strokeWidth="2" />
      {/* 책상 상판 + 서랍 */}
      <rect x={x - 6} y={322} width={W + 12} height={14} rx={4} fill="#c9a574" />
      <rect x={x - 6} y={322} width={W + 12} height={4} rx={2} fill="#ddbf92" />
      <rect x={x + 8} y={336} width={W - 16} height={84} fill="#d9cdb8" />
      <rect x={x + 34} y={352} width={W - 68} height={26} rx={3} fill="none" stroke="#0000002e" strokeWidth="2" />
      <rect x={x + W / 2 - 10} y={362} width={20} height={4} rx={2} fill="#8a6a43" />
      {/* 연필꽂이 */}
      <rect x={x + 22} y={304} width={14} height={18} rx={2} fill="#6aa6a0" />
      <path d={`M${x + 25} 304l-2-14M${x + 29} 304v-18M${x + 33} 304l3-12`} stroke="#d96c6c" strokeWidth="2" strokeLinecap="round" />
      {/* 스탠드 조명 */}
      {live && <circle cx={x + 104} cy={272} r={58} fill="#ffd98a" opacity=".22" />}
      <rect x={x + 102} y={318} width={20} height={4} rx={2} fill="#3b3f55" />
      <path d={`M${x + 112} 318L${x + 100} 272L${x + 116} 250`} stroke="#3b3f55" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={`M${x + 104} 246l12-10 16 12-6 10z`} fill={live ? "#e8b04a" : "#7f8aa8"} />
      {live && <polygon points={`${x + 108},262 ${x + 128},262 ${x + 150},322 ${x + 84},322`} fill="#fff0b8" opacity=".38" />}
      {/* 책상 위 플래너 / 노트 */}
      {live ? (
        <g>
          <path d={`M${x + 40} 320l32-6v-26l-32 6z`} fill="#fffdf6" />
          <path d={`M${x + 72} 314l32 6v-26l-32-6z`} fill="#fffdf6" />
          <path d={`M${x + 72} 314v-26`} stroke="#c9b690" />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={x + 46} y={295 + r * 7 - r * 1.2} width="5" height="4" fill={["#6fae7e", "#6fae7e", "#e8b04a"][r]} />
              <path d={`M${x + 54} ${297 + r * 6.2}h14`} stroke="#9aa0b2" strokeWidth="2" />
            </g>
          ))}
          <path d={`M${x + 80} 296h18M${x + 80} 303h14M${x + 80} 310h16`} stroke="#5b7fbf" strokeWidth="2" />
        </g>
      ) : (
        <rect x={x + 44} y={304} width={54} height={18} rx={2} fill={["#7fae7a", "#8e6bb3", "#5b7fbf", "#c9795a", "#e8b04a"][i % 5]} />
      )}
      {!live && <rect x={x} y={118} width={W} height={302} rx={8} fill="#2e3a5c" opacity=".16" />}
      {/* 명패 */}
      <rect x={x + 8} y={86} width={W - 16} height={26} rx={7} fill={live ? "#d8b25a" : "#9a9078"} />
      <circle cx={x + 24} cy={99} r={10} fill={live ? "#7a5a1e" : "#6e6654"} />
      <text x={x + 24} y={104} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">{i + 1}</text>
      <text x={x + 40} y={104} fontSize="12.5" fontWeight="700" fill={live ? "#3b2a0e" : "#4a4434"}>{live ? "인생게임 플래너" : "빈 자리"}</text>
      {live && (
        <g>
          <rect x={cx - 38} y={428} width={76} height={24} rx={12} fill="#2f4b8f" />
          <text x={cx} y={445} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">열기 ↗</text>
        </g>
      )}
    </g>
  );
}

export default function StudyRoom({ plannerUrl }: { plannerUrl: string }) {
  return (
    <svg className="scene" viewBox="0 0 960 540" role="group" aria-label="자습실: 칸막이 독서실 책상 다섯 자리. 1번 자리는 인생게임 플래너로 연결됩니다.">
      <defs>
        <linearGradient id="s-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7186ab" /><stop offset="1" stopColor="#586a90" /></linearGradient>
        <linearGradient id="s-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfa274" /><stop offset="1" stopColor="#b6875c" /></linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#s-wall)" />
      <rect y="420" width="960" height="120" fill="url(#s-floor)" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2="960" y1={444 + i * 26} y2={444 + i * 26} stroke="#0000001f" />)}
      <rect y="416" width="960" height="6" fill="#6f4d31" />

      {/* 천장 조명 */}
      {[130, 420, 710].map((x) => (
        <g key={x}><ellipse cx={x + 60} cy={10} rx={110} ry={26} fill="#fff8e0" opacity=".18" /><rect x={x} y={0} width={120} height={9} rx={3} fill="#fff8e0" /></g>
      ))}
      {/* 벽시계 + 칠판 안내 */}
      <circle cx="480" cy="52" r="26" fill="#f7f1e6" stroke="#3b2d20" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={480 + Math.sin(a) * 20} y1={52 - Math.cos(a) * 20} x2={480 + Math.sin(a) * 23} y2={52 - Math.cos(a) * 23} stroke="#3b2d20" strokeWidth="2" />;
      })}
      <path d="M480 52V36M480 52l12 8" stroke="#3b2d20" strokeWidth="3" strokeLinecap="round" />
      <rect x="60" y="22" width="230" height="52" rx="5" fill="#b0814f" />
      <rect x="66" y="28" width="218" height="40" fill="#2e4a45" />
      <text x="175" y="46" textAnchor="middle" fontSize="15" fontWeight="700" fill="#ffe08a" fontFamily="system-ui,sans-serif">FOCUS ZONE</text>
      <text x="175" y="62" textAnchor="middle" fontSize="12" fill="#e6f0e8" fontFamily="system-ui,sans-serif">조용히 · 집중해서</text>
      <rect x="670" y="22" width="230" height="52" rx="5" fill="#b0814f" />
      <rect x="676" y="28" width="218" height="40" fill="#2e4a45" />
      <text x="785" y="46" textAnchor="middle" fontSize="15" fontWeight="700" fill="#f4b8b0" fontFamily="system-ui,sans-serif">TODAY&apos;S PLAN</text>
      <text x="785" y="62" textAnchor="middle" fontSize="12" fill="#e6f0e8" fontFamily="system-ui,sans-serif">계획 · 실천 · 복습</text>

      {Array.from({ length: SEATS }, (_, i) =>
        i === 0 ? (
          <a key={i} className="shelf-link" href={plannerUrl} target="_blank" rel="noopener noreferrer" aria-label="1번 자리: 인생게임 플래너 (새 창에서 열기)">
            <Seat i={i} url={plannerUrl} />
          </a>
        ) : (
          <g key={i} role="img" aria-label={`${i + 1}번 자리 (빈 자리)`}><Seat i={i} /></g>
        ),
      )}

      {/* 1번 자리 의자 */}
      <ellipse cx="124" cy="502" rx="40" ry="8" fill="#0002" />
      <rect x="92" y="462" width="64" height="34" rx="12" fill="#6aa6a0" />
      <rect x="100" y="468" width="48" height="6" rx="3" fill="#ffffff55" />
      <rect x="118" y="496" width="12" height="14" fill="#3b3f55" />
      {/* 화분 */}
      {[22, 938].map((x) => (
        <g key={x}>
          <path d={`M${x - 14} 510l-5-40h38l-5 40z`} fill="#c9795a" />
          <g fill="#5f9a6f"><ellipse cx={x - 8} cy="450" rx="8" ry="26" transform={`rotate(-22 ${x - 8} 450)`} /><ellipse cx={x + 5} cy="442" rx="8" ry="30" /><ellipse cx={x + 16} cy="452" rx="8" ry="26" transform={`rotate(24 ${x + 16} 452)`} /></g>
        </g>
      ))}
    </svg>
  );
}
