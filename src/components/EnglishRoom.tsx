// 영어관 일러스트 (정면 구도). 노을 지는 런던 창문 + 책장 + 칠판 + 책상.
const BOOK_COLORS = ["#d96c6c", "#e8b04a", "#6aa6a0", "#5b7fbf", "#f0e6d2", "#8e6bb3", "#c9795a", "#7fae7a", "#2f4b8f"];

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

function Books({ baseY, x0, x1, seed, gaps = [] }: { baseY: number; x0: number; x1: number; seed: number; gaps?: [number, number][] }) {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  let x = x0, i = 0;
  while (x < x1 - 8) {
    const gap = gaps.find(([a, b]) => x >= a && x < b);
    if (gap) { x = gap[1]; continue; }
    const w = 9 + Math.floor(r() * 9);
    const h = 38 + Math.floor(r() * 28);
    const c = BOOK_COLORS[Math.floor(r() * BOOK_COLORS.length)];
    const lean = r() > 0.93;
    out.push(
      <g key={i++} transform={lean ? `rotate(-9 ${x + w} ${baseY})` : undefined}>
        <rect x={x} y={baseY - h} width={w} height={h} rx={1.5} fill={c} />
        <rect x={x + 2} y={baseY - h + 7} width={w - 4} height={2} fill="#fff" opacity=".55" />
        <rect x={x + 2} y={baseY - 12} width={w - 4} height={2} fill="#fff" opacity=".35" />
      </g>,
    );
    x += w + 1;
  }
  return <>{out}</>;
}

export default function EnglishRoom() {
  const bulbs = Array.from({ length: 20 }, (_, i) => 24 + i * 48);
  return (
    <svg className="scene" viewBox="0 0 960 540" role="img" aria-label="영어관: 책장, 칠판, 노을 지는 창문이 있는 아늑한 영어 학습 공간">
      <defs>
        <linearGradient id="e-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d7cc4" /><stop offset=".55" stopColor="#c58fb4" /><stop offset="1" stopColor="#f7c68b" />
        </linearGradient>
        <linearGradient id="e-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6ecdc" /><stop offset="1" stopColor="#eadcc6" />
        </linearGradient>
        <linearGradient id="e-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfa274" /><stop offset="1" stopColor="#b6875c" />
        </linearGradient>
        <linearGradient id="e-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe2b0" stopOpacity=".55" /><stop offset="1" stopColor="#ffe2b0" stopOpacity="0" />
        </linearGradient>
        <clipPath id="e-win"><rect x="334" y="74" width="292" height="214" rx="4" /></clipPath>
      </defs>

      {/* 벽 · 걸레받이 · 바닥 */}
      <rect width="960" height="540" fill="url(#e-wall)" />
      <rect y="352" width="960" height="52" fill="#7d9cc4" />
      <rect y="348" width="960" height="7" fill="#f7f1e6" />
      <rect y="400" width="960" height="5" fill="#5f7ea8" />
      <rect y="404" width="960" height="136" fill="url(#e-floor)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="0" x2="960" y1={420 + i * 28} y2={420 + i * 28} stroke="#0000001f" />
      ))}

      {/* 창문 */}
      <rect x="320" y="60" width="320" height="240" rx="8" fill="#f9f4ea" />
      <g clipPath="url(#e-win)">
        <rect x="334" y="74" width="292" height="214" fill="url(#e-sky)" />
        <circle cx="386" cy="112" r="15" fill="#fff6d8" />
        <circle cx="391" cy="108" r="13" fill="#7d86c2" opacity=".35" />
        {[[420, 96], [452, 120], [356, 150], [590, 100], [560, 128]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" opacity=".85" />
        ))}
        <ellipse cx="450" cy="210" rx="52" ry="10" fill="#f7d1c4" opacity=".7" />
        <ellipse cx="580" cy="190" rx="40" ry="8" fill="#f7d1c4" opacity=".6" />
        {/* 런던 스카이라인 + 빅벤 */}
        <g fill="#34426b">
          <rect x="334" y="236" width="40" height="52" /><rect x="378" y="222" width="30" height="66" />
          <rect x="412" y="244" width="38" height="44" /><rect x="454" y="232" width="34" height="56" />
          <rect x="532" y="226" width="96" height="62" />
          <rect x="544" y="214" width="10" height="12" /><rect x="574" y="214" width="10" height="12" /><rect x="604" y="214" width="10" height="12" />
          <rect x="498" y="134" width="32" height="154" />
          <polygon points="494,134 514,86 534,134" />
          <rect x="511" y="70" width="6" height="18" />
        </g>
        <circle cx="514" cy="158" r="10" fill="#fdf0c6" />
        <path d="M514 151v7h5" stroke="#34426b" strokeWidth="1.8" fill="none" />
        {[[408, 232], [468, 244], [345, 250], [560, 242], [590, 236]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="4" height="5" fill="#ffd98a" />
        ))}
      </g>
      <rect x="331" y="71" width="298" height="220" rx="5" fill="none" stroke="#f9f4ea" strokeWidth="6" />
      <rect x="478" y="74" width="6" height="214" fill="#f9f4ea" />
      <rect x="334" y="176" width="292" height="6" fill="#f9f4ea" />
      <rect x="312" y="298" width="336" height="12" rx="4" fill="#efe4d0" />
      {/* 화분 */}
      <rect x="560" y="278" width="28" height="22" rx="4" fill="#c9795a" />
      <path d="M574 278c-14-16-16-30-8-44M574 278c4-20 14-30 24-34M574 278c10-10 20-12 28-8" stroke="#5f9a6f" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="566" cy="236" rx="6" ry="11" fill="#6fae7e" /><ellipse cx="598" cy="242" rx="6" ry="11" fill="#6fae7e" transform="rotate(30 598 242)" />

      {/* 커튼 */}
      <line x1="288" y1="56" x2="672" y2="56" stroke="#8a6a43" strokeWidth="5" strokeLinecap="round" />
      <circle cx="288" cy="56" r="6" fill="#8a6a43" /><circle cx="672" cy="56" r="6" fill="#8a6a43" />
      <path d="M298 60h42c0 70-4 120 6 170 2 26-4 54-8 70h-40z" fill="#a9c4a6" />
      <path d="M622 60h42v240h-40c-4-16-10-44-8-70 10-50 6-100 6-170z" fill="#a9c4a6" />
      {[316, 330].map((x) => <path key={x} d={`M${x} 64v232`} stroke="#8aa987" strokeWidth="2" opacity=".7" />)}
      {[634, 648].map((x) => <path key={x} d={`M${x} 64v232`} stroke="#8aa987" strokeWidth="2" opacity=".7" />)}
      <path d="M298 196q22 10 44 0" stroke="#e8b04a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M618 196q22 10 44 0" stroke="#e8b04a" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* 책장 */}
      <rect x="36" y="86" width="222" height="318" rx="6" fill="#8a6240" />
      <rect x="46" y="96" width="202" height="300" fill="#6f4d31" />
      {[155, 238, 321].map((y) => <rect key={y} x="42" y={y} width="210" height="8" fill="#b88a5b" />)}
      <rect x="42" y="396" width="210" height="8" fill="#b88a5b" />
      <Books baseY={155} x0={52} x1={242} seed={3} />
      <Books baseY={238} x0={52} x1={242} seed={11} gaps={[[168, 214]]} />
      <Books baseY={321} x0={52} x1={242} seed={7} />
      <Books baseY={396} x0={52} x1={242} seed={21} gaps={[[52, 108]]} />
      {/* 서가 소품: 지구본, 액자, 화분 */}
      <g>
        <rect x="178" y="214" width="26" height="24" fill="#d5b88a" opacity=".0" />
        <circle cx="191" cy="212" r="15" fill="#6aa6a0" /><path d="M180 206q8-8 14 0t-4 10" fill="#e8d6a0" />
        <rect x="189" y="226" width="4" height="8" fill="#b88a5b" /><rect x="180" y="234" width="22" height="4" rx="2" fill="#b88a5b" />
      </g>
      <rect x="58" y="344" width="46" height="46" rx="3" fill="#f7f1e6" />
      <rect x="64" y="350" width="34" height="34" fill="#e9a58f" />
      <path d="M64 384l12-14 8 8 6-6 8 12z" fill="#c9795a" />
      <rect x="40" y="68" width="30" height="18" rx="4" fill="#c9795a" />
      <path d="M55 68c-14-12-12-26-4-34M55 68c0-14 8-26 18-28M55 68c8-6 18-8 24-4" stroke="#5f9a6f" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* 칠판 */}
      <rect x="684" y="92" width="244" height="190" rx="6" fill="#b0814f" />
      <rect x="694" y="102" width="224" height="168" rx="2" fill="#2e4a45" />
      <rect x="694" y="270" width="224" height="8" fill="#8a6240" />
      <g fill="#e6f0e8" fontFamily="'Nanum Pen Script','Gaegu',cursive,system-ui,sans-serif">
        <text x="806" y="130" textAnchor="middle" fontSize="13" opacity=".8">Today&apos;s word</text>
        <text x="806" y="166" textAnchor="middle" fontSize="32" fontWeight="700" fill="#ffe08a">serendipity</text>
        <text x="806" y="188" textAnchor="middle" fontSize="13" opacity=".8">/ˌserənˈdɪpəti/ · 뜻밖의 행운</text>
        <line x1="716" y1="204" x2="896" y2="204" stroke="#e6f0e8" strokeDasharray="4 5" opacity=".5" />
        <text x="806" y="232" textAnchor="middle" fontSize="19" fill="#f4b8b0">Read · Speak · Write</text>
        <text x="806" y="254" textAnchor="middle" fontSize="12" opacity=".7">Keep going, one page a day ✦</text>
      </g>
      <rect x="722" y="268" width="22" height="5" rx="2" fill="#f7f1e6" /><rect x="752" y="268" width="14" height="5" rx="2" fill="#f4b8b0" />

      {/* 책상 */}
      <rect x="650" y="364" width="290" height="14" rx="4" fill="#b88a5b" />
      <rect x="664" y="378" width="12" height="94" fill="#8a6240" /><rect x="914" y="378" width="12" height="94" fill="#8a6240" />
      <rect x="688" y="378" width="88" height="46" rx="3" fill="#a07448" />
      <circle cx="732" cy="400" r="3" fill="#f7f1e6" />
      {/* 노트북 */}
      <rect x="706" y="312" width="72" height="48" rx="4" fill="#3a3f55" />
      <rect x="711" y="317" width="62" height="38" rx="2" fill="#cfe3ff" />
      <path d="M718 327h30M718 335h42M718 343h24" stroke="#5b7fbf" strokeWidth="3" strokeLinecap="round" />
      <rect x="698" y="360" width="88" height="5" rx="2" fill="#5a6078" />
      {/* 머그 + 김 */}
      <rect x="812" y="338" width="24" height="26" rx="4" fill="#f4b8b0" />
      <path d="M836 344h6a6 6 0 0 1 0 14h-6" stroke="#f4b8b0" strokeWidth="3.5" fill="none" />
      <path d="M820 330c-4-6 4-8 0-14M830 332c-4-6 4-8 0-14" stroke="#ffffffaa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* 쌓인 책 */}
      <rect x="860" y="352" width="56" height="12" rx="2" fill="#5b7fbf" />
      <rect x="864" y="340" width="50" height="12" rx="2" fill="#e8b04a" />
      <rect x="858" y="328" width="52" height="12" rx="2" fill="#d96c6c" />

      {/* 러그 + 낮은 테이블 + 펼친 책 */}
      <ellipse cx="440" cy="474" rx="200" ry="40" fill="#e9a58f" />
      <ellipse cx="440" cy="474" rx="160" ry="30" fill="none" stroke="#f9dccd" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
      <ellipse cx="440" cy="474" rx="110" ry="20" fill="#f4c3ae" />
      <ellipse cx="440" cy="446" rx="62" ry="12" fill="#d5b88a" />
      <ellipse cx="440" cy="442" rx="62" ry="12" fill="#e7cfa4" />
      <path d="M440 432l-30 4v10l30-4zM440 432l30 4v10l-30-4z" fill="#fffdf6" />
      <path d="M440 432v10" stroke="#c9b690" />
      {/* 푸프 쿠션 */}
      <ellipse cx="606" cy="470" rx="34" ry="22" fill="#e8b04a" />
      <path d="M572 468a34 18 0 0 1 68 0" fill="#f2c868" />
      <ellipse cx="606" cy="458" rx="12" ry="3.5" fill="#d99f34" />
      {/* 큰 화분 */}
      <path d="M268 470l-8-44h46l-8 44z" fill="#c9795a" />
      <g fill="#5f9a6f">
        <ellipse cx="282" cy="396" rx="9" ry="30" transform="rotate(-24 282 396)" /><ellipse cx="297" cy="388" rx="9" ry="34" />
        <ellipse cx="312" cy="398" rx="9" ry="30" transform="rotate(26 312 398)" />
      </g>
      <ellipse cx="297" cy="384" rx="5" ry="22" fill="#76b585" />

      {/* 창으로 들어오는 노을빛 */}
      <polygon points="334,300 626,300 700,540 270,540" fill="url(#e-beam)" />

      {/* 스트링 라이트 */}
      <path d={`M0 22${bulbs.map((x) => ` Q${x} 52 ${x + 24} 22`).join("")}`} stroke="#6b5a45" strokeWidth="1.5" fill="none" />
      {bulbs.map((x) => (
        <g key={x}>
          <circle cx={x} cy={40} r="9" fill="#ffd98a" opacity=".28" />
          <circle cx={x} cy={40} r="4" fill="#ffe9ae" />
        </g>
      ))}
    </svg>
  );
}
