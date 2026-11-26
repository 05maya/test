import type { CounselFile } from "@/lib/counsel";

const FW = 150, FH = 212, FY = 100, STEP = 220, X0 = 75;
const COLORS = ["#9aa7c7", "#b9a3d6", "#8fbfa5", "#e88fc0"];

function Paper({ i, x, live }: { i: number; x: number; live: boolean }) {
  const px = x + 10;
  if (live) {
    return (
      <g>
        <text x={x + FW / 2} y={140} textAnchor="middle" fontSize="11" fontWeight="800" fill="#2f4b8f" letterSpacing="1">CAREER ROADMAP</text>
        <path d={`M${px} 148h${FW - 20}`} stroke="#e88fc0" strokeWidth="2" />
        <path d={`M${x + 28} 282Q${x + 40} 256 ${x + 62} 258T${x + 96} 228T${x + 116} 196`} stroke="#e88fc0" strokeWidth="3" fill="none" strokeDasharray="2 6" strokeLinecap="round" />
        {[[28, 282], [62, 258], [96, 228], [116, 196]].map(([dx, dy], k) => (
          <circle key={k} cx={x + dx} cy={dy} r="6" fill="#2f4b8f" stroke="#fff" strokeWidth="2" />
        ))}
        <path d={`M${x + 116} 196V162`} stroke="#3b2d20" strokeWidth="2" />
        <path d={`M${x + 116} 162l18 6-18 6z`} fill="#d96c6c" />
        <text x={x + 28} y={300} textAnchor="middle" fontSize="10" fill="#6b7080">현재</text>
        <text x={x + 88} y={202} textAnchor="middle" fontSize="10" fill="#6b7080">목표</text>
      </g>
    );
  }
  if (i === 0)
    return (
      <g stroke="#c9ccd6" strokeWidth="3" strokeLinecap="round">
        <path d={`M${px + 8} 140h60`} stroke="#aab0c4" strokeWidth="5" />
        {[162, 176, 190, 204, 218, 232, 246, 260].map((y, k) => <path key={y} d={`M${px + 8} ${y}h${k % 3 === 2 ? 70 : 108}`} />)}
      </g>
    );
  if (i === 1)
    return (
      <g>
        <path d={`M${px + 8} 140h60`} stroke="#aab0c4" strokeWidth="5" strokeLinecap="round" />
        {[40, 70, 52, 96, 80].map((h, k) => <rect key={k} x={px + 12 + k * 22} y={280 - h} width="14" height={h} rx="2" fill={["#b9a3d6", "#d4c4ea"][k % 2]} />)}
        <path d={`M${px + 8} 281h112`} stroke="#c9ccd6" strokeWidth="2" />
      </g>
    );
  return (
    <g>
      <path d={`M${px + 8} 140h60`} stroke="#aab0c4" strokeWidth="5" strokeLinecap="round" />
      {[166, 196, 226, 256].map((y, k) => (
        <g key={y}>
          <rect x={px + 10} y={y - 8} width="14" height="14" rx="3" fill="none" stroke="#8fbfa5" strokeWidth="2" />
          {k < 2 && <path d={`M${px + 13} ${y - 1}l4 4 6-9`} stroke="#6fae7e" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
          <path d={`M${px + 34} ${y}h${70 - k * 6}`} stroke="#c9ccd6" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

function FileArt({ i, file }: { i: number; file: CounselFile }) {
  const live = !!file.url;
  const x = X0 + i * STEP;
  const cx = x + FW / 2;
  return (
    <g>
      <rect className="shelf-glow" x={x - 12} y={56} width={FW + 24} height={FH + 90} rx={14} fill="#ffe08a" opacity="0" />
      {/* 걸이 끈 */}
      <path d={`M${cx} 60L${x + 34} ${FY}M${cx} 60L${x + FW - 34} ${FY}`} stroke="#6b5a45" strokeWidth="2" />
      <circle cx={cx} cy={60} r={4} fill="#8a6a43" />
      {/* 폴더 + A4 용지 */}
      <rect x={x + 4} y={FY + 6} width={FW} height={FH} rx={6} fill="#0000001f" />
      <rect x={x} y={FY} width={FW} height={FH} rx={6} fill={COLORS[i]} />
      <rect x={x + 10} y={FY + 16} width={FW - 20} height={FH - 26} fill="#fffdf6" />
      <Paper i={i} x={x} live={live} />
      <rect x={x + 48} y={FY - 8} width={54} height={24} rx={6} fill="#8a8fa5" />
      <rect x={x + 58} y={FY - 2} width={34} height={10} rx={3} fill="#d8dbe6" />
      {!live && <rect x={x} y={FY} width={FW} height={FH} rx={6} fill="#3b2d3b" opacity=".2" />}
      {/* 명패 */}
      <rect x={x + 6} y={324} width={FW - 12} height={26} rx={7} fill={live ? "#d8b25a" : "#9a9078"} />
      <circle cx={x + 22} cy={337} r={10} fill={live ? "#7a5a1e" : "#6e6654"} />
      <text x={x + 22} y={342} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">{file.no}</text>
      <text x={x + 38} y={342} fontSize="13" fontWeight="700" fill={live ? "#3b2a0e" : "#4a4434"}>{file.title}</text>
      {live && (
        <g>
          <rect x={cx - 38} y={360} width={76} height={24} rx={12} fill="#2f4b8f" />
          <text x={cx} y={377} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">열기 ↗</text>
        </g>
      )}
    </g>
  );
}

export default function CounselRoom({ files }: { files: CounselFile[] }) {
  return (
    <svg className="scene" viewBox="0 0 960 540" role="group" aria-label="상담실: A4 파일 네 개. 4번 파일은 진로 로드맵으로 연결됩니다.">
      <defs>
        <linearGradient id="c-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8e8e4" /><stop offset="1" stopColor="#eed5d0" /></linearGradient>
        <linearGradient id="c-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfa274" /><stop offset="1" stopColor="#b6875c" /></linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#c-wall)" />
      <rect y="372" width="960" height="30" fill="#c9a0b8" />
      <rect y="368" width="960" height="6" fill="#f7f1e6" />
      <rect y="400" width="960" height="140" fill="url(#c-floor)" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2="960" y1={426 + i * 28} y2={426 + i * 28} stroke="#0000001f" />)}

      {/* 간판 + 봉 */}
      <rect x="360" y="12" width="240" height="30" rx="9" fill="#2f4b8f" />
      <text x="480" y="33" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff" letterSpacing="2">상담실 · COUNSELING</text>
      <rect x="50" y="56" width="860" height="6" rx="3" fill="#8a6a43" />
      <circle cx="50" cy="59" r="7" fill="#8a6a43" /><circle cx="910" cy="59" r="7" fill="#8a6a43" />

      {files.map((f, i) =>
        f.url ? (
          <a key={f.no} className="shelf-link" href={f.url} target="_blank" rel="noopener noreferrer" aria-label={`${f.no}번 파일: ${f.title} (새 창에서 열기)`}>
            <FileArt i={i} file={f} />
          </a>
        ) : (
          <g key={f.no} role="img" aria-label={`${f.no}번 파일 (준비 중)`}><FileArt i={i} file={f} /></g>
        ),
      )}

      {/* 러그 + 소파 + 테이블 */}
      <ellipse cx="480" cy="496" rx="240" ry="30" fill="#8fb1c8" />
      <ellipse cx="480" cy="496" rx="200" ry="22" fill="none" stroke="#d4e4ef" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
      <rect x="318" y="408" width="324" height="60" rx="18" fill="#6f8fa3" />
      <rect x="298" y="438" width="364" height="44" rx="14" fill="#7fa0b5" />
      <rect x="282" y="420" width="40" height="62" rx="14" fill="#6f8fa3" /><rect x="638" y="420" width="40" height="62" rx="14" fill="#6f8fa3" />
      <path d="M480 440v40" stroke="#00000022" strokeWidth="2" />
      <rect x="338" y="414" width="52" height="40" rx="10" fill="#f4b8b0" transform="rotate(-6 364 434)" />
      <rect x="570" y="414" width="52" height="40" rx="10" fill="#e8b04a" transform="rotate(6 596 434)" />
      <rect x="312" y="482" width="10" height="14" fill="#5a4630" /><rect x="638" y="482" width="10" height="14" fill="#5a4630" />
      <ellipse cx="480" cy="520" rx="62" ry="11" fill="#b88a5b" />
      <ellipse cx="480" cy="516" rx="62" ry="11" fill="#d5b88a" />
      <rect x="448" y="500" width="18" height="15" rx="3" fill="#fffdf6" /><rect x="494" y="500" width="18" height="15" rx="3" fill="#f4b8b0" />
      <path d="M457 496c-3-5 3-6 0-11" stroke="#ffffffaa" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 플로어 램프 */}
      <rect x="236" y="404" width="4" height="86" fill="#3b3f55" /><rect x="222" y="488" width="32" height="6" rx="3" fill="#3b3f55" />
      <circle cx="238" cy="398" r="40" fill="#ffd98a" opacity=".22" />
      <path d="M218 408l8-30h24l8 30z" fill="#e8b04a" />
      {/* 화분 */}
      {[28, 932].map((x) => (
        <g key={x}>
          <path d={`M${x - 15} 512l-5-42h40l-5 42z`} fill="#c9795a" />
          <g fill="#5f9a6f"><ellipse cx={x - 8} cy="446" rx="8" ry="28" transform={`rotate(-22 ${x - 8} 446)`} /><ellipse cx={x + 5} cy="438" rx="8" ry="32" /><ellipse cx={x + 17} cy="448" rx="8" ry="28" transform={`rotate(24 ${x + 17} 448)`} /></g>
        </g>
      ))}
    </svg>
  );
}
