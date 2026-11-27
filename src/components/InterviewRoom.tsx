"use client";

import Link from "next/link";
import { CX, Person } from "./InterviewPeople";
import InterviewTimer from "./InterviewTimer";
import type { InterviewFile } from "@/lib/interview";

const FILE_COLORS = ["#5b7fbf", "#6aa6a0", "#9a9078"];

function FileOnDesk({ i, file }: { i: number; file: InterviewFile }) {
  const cx = CX[i];
  const live = !!file.url;
  const body = (
    <g>
      <rect className="shelf-glow" x={cx - 78} y={332} width={156} height={122} rx={10} fill="#ffe08a" opacity="0" />
      <polygon points={`${cx - 60},338 ${cx + 60},338 ${cx + 72},368 ${cx - 72},368`} fill={FILE_COLORS[i]} />
      <polygon points={`${cx - 72},368 ${cx + 72},368 ${cx + 72},374 ${cx - 72},374`} fill="#00000038" />
      <polygon points={`${cx - 28},346 ${cx + 28},346 ${cx + 32},360 ${cx - 32},360`} fill="#fffdf6" />
      <text x={cx} y={358} textAnchor="middle" fontSize="12" fontWeight="800" fill="#3b4660">{i + 1}</text>
      <rect x={cx - 66} y={398} width={132} height={26} rx={7} fill={file.title === "준비 중" ? "#9a9078" : "#d8b25a"} />
      <circle cx={cx - 50} cy={411} r={10} fill={file.title === "준비 중" ? "#6e6654" : "#7a5a1e"} />
      <text x={cx - 50} y={416} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">{file.no}</text>
      <text x={cx - 34} y={416} fontSize="13.5" fontWeight="700" fill="#3b2a0e">{file.title}</text>
      {live && (
        <g>
          <rect x={cx - 36} y={429} width={72} height={20} rx={10} fill="#2f4b8f" />
          <text x={cx} y={443} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">입장 →</text>
        </g>
      )}
    </g>
  );
  return live ? (
    <Link className="shelf-link" href={file.url!} aria-label={`${file.no}번 ${file.title}실 입장`}>{body}</Link>
  ) : (
    <g role="img" aria-label={`${file.no}번 ${file.title}`}>{body}</g>
  );
}

export default function InterviewRoom({ files }: { files: InterviewFile[] }) {
  return (
    <svg className="scene" viewBox="0 0 960 540" role="group" aria-label="면접실: 면접위원 세 명이 앉아 있고, 뒤 벽에 면접 타이머가 있으며, 책상 위에 파일 세 개가 놓여 있습니다.">
      <defs>
        <linearGradient id="i-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b7fa6" /><stop offset="1" stopColor="#55678d" /></linearGradient>
        <linearGradient id="i-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a6a8c" /><stop offset="1" stopColor="#47557a" /></linearGradient>
        <linearGradient id="i-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9a574" /><stop offset="1" stopColor="#b48c5c" /></linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#i-wall)" />
      <rect y="320" width="960" height="84" fill="#8a6a43" opacity=".35" />
      <rect y="400" width="960" height="140" fill="url(#i-floor)" />
      <rect y="396" width="960" height="8" fill="#3b4660" />

      {/* 벽 장식: 액자 + 블라인드 창 */}
      <rect x="56" y="80" width="70" height="90" rx="3" fill="#f7f1e6" stroke="#b88a5b" strokeWidth="4" />
      <rect x="66" y="90" width="50" height="70" fill="#cfe0f2" /><path d="M66 160l16-24 12 14 10-12 12 22z" fill="#8bb08f" />
      <rect x="140" y="104" width="50" height="62" rx="3" fill="#f7f1e6" stroke="#b88a5b" strokeWidth="4" />
      <circle cx="165" cy="130" r="14" fill="#e8b04a" /><rect x="152" y="148" width="26" height="6" fill="#d96c6c" />
      <rect x="776" y="70" width="130" height="190" rx="4" fill="#f9f4ea" />
      <rect x="784" y="78" width="114" height="174" fill="#a9c9e8" />
      {Array.from({ length: 11 }, (_, i) => <rect key={i} x="784" y={78 + i * 14} width="114" height="9" fill="#e9e2d2" />)}

      <InterviewTimer />

      {/* 의자 등받이 + 면접위원 */}
      <Person cx={CX[0]} skin="#f0c7a4" hair="#3b2b2b" blazer="#2f4b8f" kind="bob" />
      <Person cx={CX[1]} skin="#e3b48f" hair="#2b2b33" blazer="#3d4150" kind="short" />
      <Person cx={CX[2]} skin="#c99a77" hair="#4a2f25" blazer="#8c4a5c" kind="long" />

      {/* 책상 */}
      <polygon points="190,326 770,326 810,378 150,378" fill="#d5b182" />
      <polygon points="190,326 770,326 774,332 186,332" fill="#e4c9a0" />
      <rect x="150" y="378" width="660" height="74" fill="url(#i-desk)" />
      <rect x="150" y="378" width="660" height="5" fill="#00000026" />
      {files.map((f, i) => <FileOnDesk key={f.no} i={i} file={f} />)}

      {/* 응시자 의자 등받이 */}
      <rect x="420" y="484" width="120" height="80" rx="22" fill="#44547a" />
      <rect x="432" y="494" width="96" height="14" rx="7" fill="#ffffff22" />

      {/* 화분 */}
      {[44, 916].map((x) => (
        <g key={x}>
          <path d={`M${x - 15} 500l-5-42h40l-5 42z`} fill="#c9795a" />
          <g fill="#5f9a6f"><ellipse cx={x - 8} cy="434" rx="8" ry="28" transform={`rotate(-22 ${x - 8} 434)`} /><ellipse cx={x + 5} cy="426" rx="8" ry="32" /><ellipse cx={x + 17} cy="436" rx="8" ry="28" transform={`rotate(24 ${x + 17} 436)`} /></g>
        </g>
      ))}
    </svg>
  );
}
