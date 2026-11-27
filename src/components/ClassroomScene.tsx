import MathBoard from "./MathBoard";
import VocabBoard from "./VocabBoard";
import QuizBoard from "./QuizBoard";
import { classroomColor, type Classroom, type Look, type Poster } from "@/lib/classrooms";

// 교실 공통 구조 (정면 구도): 칠판 · 게시판 · 학생 책상 · 과목 선생님.

function Desk({ cx, top, s, variant }: { cx: number; top: number; s: number; variant: number }) {
  const w = 108 * s, h = 10 * s, leg = 30 * s;
  const chairW = 40 * s;
  return (
    <g aria-hidden="true">
      <rect x={cx - w / 2 + 6 * s} y={top + h} width={4 * s} height={leg} fill="#6f4d31" />
      <rect x={cx + w / 2 - 10 * s} y={top + h} width={4 * s} height={leg} fill="#6f4d31" />
      <rect x={cx - w / 2} y={top} width={w} height={h} rx={3 * s} fill="#d9b98a" />
      <rect x={cx - w / 2} y={top} width={w} height={3 * s} rx={2 * s} fill="#ecd3ab" />
      {variant % 2 === 0 ? (
        <>
          <path d={`M${cx - 20 * s} ${top}l-2 ${-9 * s}h${22 * s}v${9 * s}zM${cx + 2 * s} ${top}v${-9 * s}h${22 * s}l-2 ${9 * s}z`} fill="#fffdf6" />
          <path d={`M${cx - 18 * s} ${top - 5 * s}h${16 * s}M${cx + 6 * s} ${top - 5 * s}h${14 * s}`} stroke="#9aa0b2" strokeWidth={1.5 * s} />
        </>
      ) : (
        <>
          <rect x={cx - 24 * s} y={top - 8 * s} width={28 * s} height={8 * s} rx={2 * s} fill={["#5b7fbf", "#6aa6a0", "#e8b04a"][variant % 3]} />
          <rect x={cx + 14 * s} y={top - 5 * s} width={18 * s} height={5 * s} rx={2 * s} fill="#d96c6c" />
        </>
      )}
      <rect x={cx - chairW / 2} y={top + h + 4 * s} width={chairW} height={30 * s} rx={7 * s} fill="#6aa6a0" />
      <rect x={cx - chairW / 2 + 4 * s} y={top + h + 8 * s} width={chairW - 8 * s} height={4 * s} rx={2 * s} fill="#ffffff44" />
      <rect x={cx - chairW / 2 + 5 * s} y={top + h + 34 * s} width={3 * s} height={22 * s} fill="#3b4660" />
      <rect x={cx + chairW / 2 - 8 * s} y={top + h + 34 * s} width={3 * s} height={22 * s} fill="#3b4660" />
    </g>
  );
}

function Pin({ x, y, c }: { x: number; y: number; c: string }) {
  return <circle cx={x} cy={y} r="3.5" fill={c} stroke="#0003" strokeWidth="1" />;
}

const CHALK_FONT = "'Nanum Pen Script','Gaegu',cursive,system-ui,sans-serif";

function PosterArt({ kind, note }: { kind: Poster; note: string }) {
  const frame = (
    <>
      <rect x="800" y="96" width="132" height="150" rx="4" fill="#f7f1e6" stroke="#b88a5b" strokeWidth="5" />
      <rect x="808" y="104" width="116" height="134" fill="#cfe0f2" />
    </>
  );
  const noteText = <text x="866" y="230" textAnchor="middle" fontSize="11" fill="#2f4b8f">{note}</text>;
  const title = (t: string) => <text x="866" y="126" textAnchor="middle" fontSize="13" fontWeight="800" fill="#2f4b8f" letterSpacing="2">{t}</text>;
  if (kind === "alphabet")
    return (
      <g>
        {frame}{title("ALPHABET")}
        <g fontSize="17" fontWeight="800" fontFamily="system-ui,sans-serif" textAnchor="middle">
          {"ABCDEFGHIJKL".split("").map((ch, i) => (
            <text key={ch} x={826 + (i % 4) * 27} y={156 + Math.floor(i / 4) * 28} fill={["#d96c6c", "#e8a030", "#3f8f6a", "#5b7fbf"][(i + Math.floor(i / 4)) % 4]}>{ch}</text>
          ))}
        </g>
        {noteText}
      </g>
    );
  if (kind === "hangul")
    return (
      <g>
        {frame}{title("한글")}
        <g fontSize="19" fontWeight="800" fontFamily="system-ui,sans-serif" textAnchor="middle">
          {"ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌ".split("").map((ch, i) => (
            <text key={ch} x={826 + (i % 4) * 27} y={158 + Math.floor(i / 4) * 28} fill={["#d96c6c", "#e8a030", "#3f8f6a", "#5b7fbf"][(i + Math.floor(i / 4)) % 4]}>{ch}</text>
          ))}
        </g>
        {noteText}
      </g>
    );
  if (kind === "graph")
    return (
      <g>
        {frame}{title("FUNCTIONS")}
        {[1, 2, 3, 4].map((i) => <path key={i} d={`M${820 + i * 21} 138V218M814 ${138 + i * 16}H918`} stroke="#ffffff" strokeWidth="1" opacity=".7" />)}
        <path d="M866 138V220M814 192H918" stroke="#2f4b8f" strokeWidth="2" />
        <path d="M832 140Q866 236 900 140" stroke="#d96c6c" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="866" cy="188" r="3.5" fill="#e8a030" />
        {noteText}
      </g>
    );
  if (kind === "map")
    return (
      <g>
        {frame}{title("WORLD")}
        <rect x="808" y="132" width="116" height="94" fill="#9fc8ea" />
        <g fill="#8fc08f">
          <path d="M818 150q14-12 30-6t8 16-18 10-22-6z" />
          <path d="M846 178q12-4 14 10t-6 22-10-8z" />
          <path d="M866 146q22-10 36 2t4 16-24 4-18-8z" />
          <path d="M876 178q16-4 24 6t-6 16-18-6z" />
        </g>
        {noteText}
      </g>
    );
  return (
    <g>
      {frame}{title("PERIODIC")}
      <g textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="system-ui,sans-serif">
        {["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg"].map((el, i) => (
          <g key={el}>
            <rect x={814 + (i % 4) * 27} y={134 + Math.floor(i / 4) * 28} width="25" height="25" rx="3" fill={["#f4b8b0", "#ffe28a", "#bfe0c4", "#b9d3f2"][(i + Math.floor(i / 4)) % 4]} />
            <text x={826.5 + (i % 4) * 27} y={151 + Math.floor(i / 4) * 28} fill="#3b4660">{el}</text>
          </g>
        ))}
      </g>
      {noteText}
    </g>
  );
}

function Teacher({ look, subject }: { look: Look; subject: string }) {
  const body = look.coat ? "#f3f5fa" : look.top;
  return (
    <g aria-hidden="true" transform="translate(200 -10)">
      <ellipse cx="590" cy="500" rx="38" ry="7" fill="#0003" />
      <rect x="574" y="438" width="14" height="60" rx="4" fill="#3b4660" /><rect x="592" y="438" width="14" height="60" rx="4" fill="#3b4660" />
      <ellipse cx="581" cy="499" rx="11" ry="5" fill="#2a2f40" /><ellipse cx="599" cy="499" rx="11" ry="5" fill="#2a2f40" />
      <rect x="556" y="368" width="68" height={look.coat ? 96 : 84} rx="20" fill={body} />
      {look.coat && <rect x="580" y="372" width="20" height="80" fill={look.top} />}
      <polygon points="582,368 590,392 598,368" fill="#f7f1e6" />
      <path d="M590 392v56" stroke="#0000001f" strokeWidth="2" />
      <rect x="552" y="378" width="14" height="58" rx="7" fill={body} />
      <g transform="translate(552 388) rotate(8 30 40)"><rect x="-8" y="30" width="30" height="40" rx="3" fill="#8a6240" /><rect x="-4" y="35" width="22" height="30" fill="#fffdf6" /><path d="M0 42h14M0 49h14M0 56h9" stroke="#9aa0b2" strokeWidth="2" /></g>
      <g transform="translate(622 378) rotate(-148)"><rect x="-7" y="0" width="14" height="52" rx="7" fill={body} /><circle cx="0" cy="56" r="8" fill="#f0c7a4" /></g>
      <rect x="583" y="350" width="14" height="22" fill="#f0c7a4" />
      <circle cx="590" cy="334" r="24" fill="#f0c7a4" />
      {look.style === "short" ? (
        <path d="M565 330Q562 306 590 306Q618 306 615 330Q604 316 590 316Q576 316 565 330Z" fill={look.hair} />
      ) : look.style === "bob" ? (
        <path d="M562 344Q556 304 590 304Q624 304 618 344L614 346Q612 318 590 318Q568 318 566 346Z" fill={look.hair} />
      ) : (
        <>
          <path d="M564 338Q560 304 590 304Q620 304 616 338Q612 318 590 318Q568 318 564 338Z" fill={look.hair} />
          {look.style === "bun" ? <circle cx="606" cy="304" r="10" fill={look.hair} /> : <path d="M612 314q22 4 14 34-4-22-14-22z" fill={look.hair} />}
        </>
      )}
      {look.glasses && (
        <g fill="none" stroke="#3b4660" strokeWidth="2"><circle cx="581" cy="336" r="6" /><circle cx="599" cy="336" r="6" /><path d="M587 336h6" /></g>
      )}
      <rect x="540" y="508" width="100" height="22" rx="11" fill="#2f4b8f" />
      <text x="590" y="523" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff">{subject} 선생님</text>
    </g>
  );
}

export default function ClassroomScene({ room, mathStart = 0 }: { room: Classroom; mathStart?: number }) {
  const wain = classroomColor(room.slug);
  const b = room.board;
  const [s1, s2, s3] = room.sticky;
  return (
    <svg className="scene" viewBox="0 0 960 540" role="img" aria-label={`${room.subject}관 교실: 가운데 칠판, 왼쪽 게시판, 학생 책상, ${room.subject} 선생님이 있는 학원 교실`}>
      <defs>
        <linearGradient id="c-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6ecdc" /><stop offset="1" stopColor="#eadcc6" /></linearGradient>
        <linearGradient id="c-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfa274" /><stop offset="1" stopColor="#b6875c" /></linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#c-wall)" />
      <rect y="352" width="960" height="52" fill={wain} />
      <rect y="348" width="960" height="7" fill="#f7f1e6" />
      <rect y="400" width="960" height="5" fill="#00000026" />
      <rect y="404" width="960" height="136" fill="url(#c-floor)" />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" x2="960" y1={420 + i * 28} y2={420 + i * 28} stroke="#0000001f" />)}

      {[130, 420, 710].map((x) => <rect key={x} x={x} y={0} width={110} height={8} rx={3} fill="#fffdf0" />)}
      <circle cx="480" cy="34" r="17" fill="#f7f1e6" stroke="#3b2d20" strokeWidth="3" />
      <path d="M480 34V24M480 34l7 4" stroke="#3b2d20" strokeWidth="2.2" strokeLinecap="round" />

      {/* 칠판 */}
      <rect x="244" y="60" width="472" height="204" rx="6" fill="#b0814f" />
      <rect x="254" y="70" width="452" height="176" rx="2" fill="#2e4a45" />
      <rect x="254" y="246" width="452" height="4" fill="#00000030" />
      <rect x="290" y="256" width="380" height="9" rx="3" fill="#8a6240" />
      <rect x="316" y="251" width="26" height="6" rx="2" fill="#f7f1e6" /><rect x="350" y="251" width="16" height="6" rx="2" fill="#f4b8b0" /><rect x="372" y="251" width="16" height="6" rx="2" fill="#ffe08a" />
      <rect x="590" y="249" width="40" height="9" rx="3" fill="#6f7a99" />
      {b.kind === "math" ? (
        <MathBoard start={mathStart} homework={`HOMEWORK  ☑ ${room.assignment}`} />
      ) : b.kind === "vocab" ? (
        <VocabBoard items={b.items} start={mathStart} homework={`HOMEWORK  ☑ ${room.assignment}`} />
      ) : b.kind === "quiz" ? (
        <QuizBoard items={b.items} title={b.title} start={mathStart} homework={`HOMEWORK  ☑ ${room.assignment}`} />
      ) : (
        <g fill="#e6f0e8" fontFamily={CHALK_FONT}>
          <text x="480" y="96" textAnchor="middle" fontSize="14" opacity=".8">{b.label}</text>
          <text x="480" y="134" textAnchor="middle" fontSize="38" fontWeight="700" fill="#ffe08a">{b.headline}</text>
          <text x="480" y="156" textAnchor="middle" fontSize="14" opacity=".8">{b.sub}</text>
          <line x1="290" y1="170" x2="670" y2="170" stroke="#e6f0e8" strokeDasharray="4 5" opacity=".45" />
          <text x="480" y="198" textAnchor="middle" fontSize="22" fill="#f4b8b0">{b.line}</text>
          <text x="480" y="228" textAnchor="middle" fontSize="16" fill="#cfe8dc">HOMEWORK  ☑ {room.assignment}</text>
        </g>
      )}

      {/* 게시판 */}
      <g aria-hidden="true">
        <rect x="40" y="96" width="186" height="216" rx="6" fill="#8a6240" />
        <rect x="49" y="105" width="168" height="198" rx="2" fill="#d2a373" />
        {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={58 + ((i * 37) % 150)} cy={114 + ((i * 53) % 180)} r="1.6" fill="#b88454" opacity=".7" />)}
        <rect x="84" y="70" width="98" height="26" rx="6" fill="#2f4b8f" />
        <text x="133" y="88" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff" letterSpacing="2">게시판</text>
        <rect x="60" y="120" width="70" height="92" fill="#fffdf6" transform="rotate(-3 95 166)" />
        <g transform="rotate(-3 95 166)"><rect x="60" y="120" width="70" height="16" fill="#d96c6c" /><text x="95" y="132" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">NOTICE</text><path d="M68 148h54M68 158h54M68 168h40M68 178h54M68 188h30" stroke="#c9ccd6" strokeWidth="3" strokeLinecap="round" /></g>
        <Pin x={121} y={124} c="#d96c6c" />
        <rect x="140" y="124" width="64" height="58" fill="#ffe28a" transform="rotate(4 172 153)" />
        <g transform="rotate(4 172 153)"><text x="172" y="146" textAnchor="middle" fontSize="11" fontWeight="800" fill="#5a4310">{s1}</text><text x="172" y="160" textAnchor="middle" fontSize="11" fontWeight="800" fill="#5a4310">{s2}</text><text x="172" y="176" textAnchor="middle" fontSize="13" fontWeight="800" fill="#d96c6c">{s3}</text></g>
        <Pin x={172} y={128} c="#5b7fbf" />
        <rect x="62" y="222" width="86" height="64" fill="#fffdf6" transform="rotate(2 105 254)" />
        <g transform="rotate(2 105 254)" stroke="#9aa0b2" strokeWidth="1.4" fill="none"><rect x="62" y="222" width="86" height="64" /><path d="M62 238h86M62 254h86M62 270h86M91 222v64M120 222v64" /></g>
        <rect x="64" y="224" width="26" height="13" fill="#6aa6a0" opacity=".6" transform="rotate(2 105 254)" /><rect x="93" y="256" width="26" height="13" fill="#e8b04a" opacity=".6" transform="rotate(2 105 254)" />
        <Pin x={105} y={227} c="#6fae7e" />
        <rect x="158" y="196" width="46" height="54" fill="#fffdf6" transform="rotate(-5 181 223)" />
        <g transform="rotate(-5 181 223)"><rect x="162" y="200" width="38" height="36" fill="#cfe0f2" /><path d="M162 236l10-14 8 8 6-6 14 12z" fill="#8bb08f" /></g>
        <Pin x={181} y={200} c="#e8b04a" />
        <rect x="156" y="256" width="50" height="34" fill="#f4b8b0" transform="rotate(3 181 273)" />
        <g transform="rotate(3 181 273)"><path d="M164 266l5 5 9-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M184 268h14M184 276h10" stroke="#ffffffaa" strokeWidth="2.5" strokeLinecap="round" /></g>
        <Pin x={181} y={259} c="#d96c6c" />
      </g>

      <g aria-hidden="true"><PosterArt kind={room.poster} note={room.posterNote} /></g>

      {[120, 270, 420, 570].map((cx, i) => <Desk key={cx} cx={cx} top={420} s={1} variant={i} />)}
      {[195, 345, 495, 645].map((cx, i) => <Desk key={cx} cx={cx} top={456} s={1.2} variant={i + 1} />)}

      <Teacher look={room.look} subject={room.subject} />
    </svg>
  );
}
