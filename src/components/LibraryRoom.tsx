import Books from "./Books";
import type { Shelf } from "@/lib/library";

const SHELF_W = 200, SHELF_TOP = 92, SHELF_H = 312;
const xs = [40, 260, 480, 700];

function ShelfArt({ x, shelf }: { x: number; shelf: Shelf }) {
  const live = !!shelf.url;
  const rows = [176, 252, 328, 396];
  return (
    <g>
      <rect className="shelf-glow" x={x - 8} y={SHELF_TOP - 34} width={SHELF_W + 16} height={SHELF_H + 44} rx={12} fill="#ffe08a" opacity="0" />
      <rect x={x} y={SHELF_TOP} width={SHELF_W} height={SHELF_H} rx={6} fill="#8a6240" />
      <rect x={x + 9} y={SHELF_TOP + 9} width={SHELF_W - 18} height={SHELF_H - 18} fill="#5a3f29" />
      {[176, 252, 328].map((y) => <rect key={y} x={x + 5} y={y} width={SHELF_W - 10} height={8} fill="#b88a5b" />)}
      <rect x={x + 5} y={396} width={SHELF_W - 10} height={8} fill="#b88a5b" />
      {rows.map((y, i) => (
        <Books key={y} baseY={y} x0={x + 14} x1={x + SHELF_W - 12} seed={shelf.no * 17 + i * 5 + 3} hMax={i === 3 ? 56 : 64} />
      ))}
      {!live && <rect x={x + 9} y={SHELF_TOP + 9} width={SHELF_W - 18} height={SHELF_H - 18} fill="#2b2118" opacity=".38" />}
      {/* 황동 명패 */}
      <rect x={x + 10} y={SHELF_TOP - 28} width={SHELF_W - 20} height={26} rx={7} fill={live ? "#d8b25a" : "#9a9078"} />
      <circle cx={x + 28} cy={SHELF_TOP - 15} r={10} fill={live ? "#7a5a1e" : "#6e6654"} />
      <text x={x + 28} y={SHELF_TOP - 10} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">{shelf.no}</text>
      <text x={x + 46} y={SHELF_TOP - 10} fontSize="13.5" fontWeight="700" fill={live ? "#3b2a0e" : "#4a4434"}>{shelf.title}</text>
      {live && (
        <g>
          <rect x={x + 48} y={SHELF_TOP + SHELF_H + 14} width={SHELF_W - 96} height={24} rx={12} fill="#2f4b8f" />
          <text x={x + SHELF_W / 2} y={SHELF_TOP + SHELF_H + 31} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">열기 ↗</text>
        </g>
      )}
    </g>
  );
}

export default function LibraryRoom({ shelves }: { shelves: Shelf[] }) {
  return (
    <svg className="scene" viewBox="0 0 960 540" role="group" aria-label="도서관: 책장 네 개. 1번 책장은 생기부 도서추천으로 연결됩니다.">
      <defs>
        <linearGradient id="l-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5f8077" /><stop offset="1" stopColor="#4a6a62" /></linearGradient>
        <linearGradient id="l-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c99a6c" /><stop offset="1" stopColor="#ad7f55" /></linearGradient>
        <radialGradient id="l-glow"><stop offset="0" stopColor="#ffe9b0" stopOpacity=".5" /><stop offset="1" stopColor="#ffe9b0" stopOpacity="0" /></radialGradient>
      </defs>

      <rect width="960" height="540" fill="url(#l-wall)" />
      <rect y="404" width="960" height="136" fill="url(#l-floor)" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2="960" y1={432 + i * 30} y2={432 + i * 30} stroke="#0000001f" />)}
      <rect y="400" width="960" height="8" fill="#6f4d31" />

      {/* 펜던트 조명 */}
      {[240, 480, 720].map((x) => (
        <g key={x}>
          <circle cx={x} cy={64} r={90} fill="url(#l-glow)" />
          <line x1={x} y1={0} x2={x} y2={30} stroke="#3b2d20" strokeWidth="2" />
          <path d={`M${x - 24} 56a24 26 0 0 1 48 0z`} fill="#d9b44a" />
          <rect x={x - 6} y={56} width={12} height={5} rx={2} fill="#fff1b8" />
        </g>
      ))}

      {shelves.map((s, i) => {
        const art = <ShelfArt x={xs[i]} shelf={s} />;
        return s.url ? (
          <a key={s.no} className="shelf-link" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.no}번 책장: ${s.title} (새 창에서 열기)`}>
            {art}
          </a>
        ) : (
          <g key={s.no} role="img" aria-label={`${s.no}번 책장 (준비 중)`}>{art}</g>
        );
      })}

      {/* 러그 + 열람 테이블 */}
      <ellipse cx="480" cy="494" rx="250" ry="34" fill="#b86b5b" />
      <ellipse cx="480" cy="494" rx="212" ry="25" fill="none" stroke="#e8b6a6" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
      <rect x="372" y="452" width="216" height="14" rx="5" fill="#b88a5b" />
      <rect x="384" y="466" width="10" height="38" fill="#8a6240" /><rect x="566" y="466" width="10" height="38" fill="#8a6240" />
      <path d="M470 446l-32 4v8l32-4zM470 446l32 4v8l-32-4z" fill="#fffdf6" />
      <rect x="530" y="438" width="3" height="14" fill="#3b2d20" /><path d="M514 438l9-18h20l9 18z" fill="#6fae7e" />
      <rect x="402" y="436" width="22" height="16" rx="3" fill="#f4b8b0" />
      <path d="M414 430c-4-6 4-8 0-14" stroke="#ffffffaa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 스툴 */}
      {[318, 642].map((x) => (
        <g key={x}><ellipse cx={x} cy={478} rx={26} ry={9} fill="#e8b04a" /><rect x={x - 26} y={478} width={52} height={14} fill="#d99f34" /><ellipse cx={x} cy={492} rx={26} ry={9} fill="#d99f34" /></g>
      ))}
      {/* 화분 */}
      {[22, 938].map((x) => (
        <g key={x}>
          <path d={`M${x - 14} 500l-5-40h38l-5 40z`} fill="#c9795a" />
          <g fill="#5f9a6f"><ellipse cx={x - 8} cy="440" rx="8" ry="26" transform={`rotate(-22 ${x - 8} 440)`} /><ellipse cx={x + 5} cy="432" rx="8" ry="30" /><ellipse cx={x + 16} cy="442" rx="8" ry="26" transform={`rotate(24 ${x + 16} 442)`} /></g>
        </g>
      ))}
    </svg>
  );
}
