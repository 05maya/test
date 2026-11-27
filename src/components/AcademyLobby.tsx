import Link from "next/link";
import { canEnter, roomBySlug } from "@/lib/rooms";

// 학원 건물 단면: 3층(명예의 전당) · 2층 · 1층.
const FLOOR_GAP = 242;
const FLOORS = [
  { label: "3F", floorY: 260, hall: true as const },
  { label: "2F", floorY: 260 + FLOOR_GAP, rooms: ["english", "math", "korean", "social", "science"] },
  { label: "1F", floorY: 260 + FLOOR_GAP * 2, rooms: ["library", "study", "interview", "counsel", "parents"] },
];
const GROUND_Y = 560 + FLOOR_GAP;
const VB_H = 640 + FLOOR_GAP;
const BX = 30, BW = 900;
const DOOR_W = 100, DOOR_H = 142;
const GAP = (BW - DOOR_W * 5) / 6;
const doorX = (i: number) => BX + GAP + DOOR_W / 2 + i * (GAP + DOOR_W);

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <path d={`M${x - 11} ${y}l-3-22h28l-3 22z`} fill="#c9795a" />
      <g fill="#5f9a6f">
        <ellipse cx={x - 6} cy={y - 34} rx="5" ry="16" transform={`rotate(-24 ${x - 6} ${y - 34})`} />
        <ellipse cx={x + 3} cy={y - 40} rx="5" ry="19" />
        <ellipse cx={x + 11} cy={y - 33} rx="5" ry="16" transform={`rotate(26 ${x + 11} ${y - 33})`} />
      </g>
    </g>
  );
}
function Sconce({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r="30" fill="#ffd98a" opacity=".28" />
      <rect x={x - 3} y={y - 4} width="6" height="12" fill="#8a6a43" />
      <path d={`M${x - 10} ${y - 4}l4-14h12l4 14z`} fill="#e8b04a" />
    </g>
  );
}
function Frame({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <rect x={x - 15} y={y} width="30" height="38" rx="2" fill="#f7f1e6" stroke="#b88a5b" strokeWidth="3" />
      <rect x={x - 10} y={y + 5} width="20" height="28" fill="#cfe0f2" />
      <path d={`M${x - 10} ${y + 33}l6-10 5 6 4-5 5 9z`} fill="#8bb08f" />
    </g>
  );
}

function Trophy({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-16 -36H16V-20C16-6 6 2 0 2C-6 2-16-6-16-20Z" fill="#e8c14a" />
      <path d="M-16-32H-25C-25-18-21-14-15-14M16-32H25C25-18 21-14 15-14" stroke="#d8a932" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="-3" y="2" width="6" height="10" fill="#d8a932" />
      <rect x="-13" y="12" width="26" height="7" rx="2" fill="#b4812a" />
      <path d="M-9-30V-22" stroke="#fff6c8" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}
function Medal({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-6-14L0 0L6-14Z" fill="#d96c6c" />
      <circle cx="0" cy="6" r="8" fill="#e8c14a" stroke="#b4812a" strokeWidth="2" />
      <path d="M0 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill="#fff6c8" />
    </g>
  );
}

function TrophyCase({ cx, floorY, v }: { cx: number; floorY: number; v: number }) {
  const top = floorY - DOOR_H;
  const s1 = top + 52, s2 = top + 98;
  return (
    <g aria-hidden="true">
      <rect x={cx - 52} y={top} width="104" height={DOOR_H} rx="6" fill="#6b4a30" />
      <rect x={cx - 44} y={top + 8} width="88" height={DOOR_H - 16} fill="#4a2f45" />
      <rect x={cx - 44} y={top + 8} width="88" height="12" fill="#ffd98a" opacity=".3" />
      <rect x={cx - 44} y={s1} width="88" height="5" fill="#b88a5b" />
      <rect x={cx - 44} y={s2} width="88" height="5" fill="#b88a5b" />
      {v === 0 ? (
        <>
          <Trophy x={cx} y={s1 - 19} s={0.95} />
          <Trophy x={cx - 24} y={s2 - 14} s={0.6} /><Trophy x={cx + 24} y={s2 - 14} s={0.6} />
          <Medal x={cx - 22} y={top + 116} /><Medal x={cx + 22} y={top + 116} />
        </>
      ) : v === 1 ? (
        <>
          <Trophy x={cx - 20} y={s1 - 13} s={0.7} /><Trophy x={cx + 20} y={s1 - 13} s={0.7} />
          <Trophy x={cx} y={s2 - 19} s={0.95} />
          <rect x={cx - 26} y={top + 112} width="52" height="14" rx="2" fill="#d8b25a" />
        </>
      ) : (
        <>
          <Medal x={cx - 22} y={top + 36} /><Medal x={cx} y={top + 36} /><Medal x={cx + 22} y={top + 36} />
          <Trophy x={cx} y={s1 + 28} s={0.7} />
          <Trophy x={cx - 22} y={s2 - 14} s={0.6} /><Trophy x={cx + 22} y={s2 - 14} s={0.6} />
        </>
      )}
      <polygon points={`${cx - 44},${top + 8} ${cx - 14},${top + 8} ${cx - 44},${top + 60}`} fill="#fff" opacity=".13" />
      <polygon points={`${cx + 10},${top + 8} ${cx + 22},${top + 8} ${cx - 14},${top + DOOR_H - 8} ${cx - 26},${top + DOOR_H - 8}`} fill="#fff" opacity=".08" />
    </g>
  );
}

function HallDoor({ cx, floorY, ok }: { cx: number; floorY: number; ok: boolean }) {
  const room = roomBySlug("hall")!;
  const h = 150, top = floorY - h;
  return (
    <g className={`door${ok ? "" : " locked"}`}>
      <rect x={cx - 95} y={floorY + 4} width="190" height="26" rx="4" fill="#b4474f" />
      <rect x={cx - 95} y={floorY + 4} width="190" height="26" rx="4" fill="none" stroke="#e8c14a" strokeWidth="2" strokeDasharray="6 4" />
      <rect x={cx - 112} y={top - 8} width="224" height={h + 8} rx="10" fill="#d8b25a" />
      <rect className="leaf" x={cx - 102} y={top} width="100" height={h} rx="3" fill="#2f3a6b" />
      <rect className="leaf" x={cx + 2} y={top} width="100" height={h} rx="3" fill="#2f3a6b" />
      <rect x={cx - 90} y={top + 12} width="76" height="52" rx="4" fill="#fff8e0" opacity=".28" />
      <rect x={cx + 14} y={top + 12} width="76" height="52" rx="4" fill="#fff8e0" opacity=".28" />
      <rect x={cx - 90} y={top + 78} width="76" height="58" rx="3" fill="none" stroke="#e8c14a" strokeWidth="2" opacity=".8" />
      <rect x={cx + 14} y={top + 78} width="76" height="58" rx="3" fill="none" stroke="#e8c14a" strokeWidth="2" opacity=".8" />
      <circle cx={cx} cy={top + 46} r="27" fill="#e8c14a" stroke="#b4812a" strokeWidth="3" />
      <text x={cx} y={top + 57} textAnchor="middle" fontSize="30">{ok ? "🏆" : "🔒"}</text>
      <circle cx={cx - 10} cy={top + 96} r="4" fill="#f6e3a0" /><circle cx={cx + 10} cy={top + 96} r="4" fill="#f6e3a0" />
      <rect x={cx - 74} y={top - 50} width="148" height="30" rx="9" fill="#d8b25a" stroke="#b4812a" strokeWidth="2" />
      <text x={cx} y={top - 29} textAnchor="middle" fontSize="15.5" fontWeight="800" fill="#3b2a0e">{room.name}</text>
      <text x={cx - 90} y={top - 29} textAnchor="middle" fontSize="16" fill="#e8c14a">✦</text>
      <text x={cx + 90} y={top - 29} textAnchor="middle" fontSize="16" fill="#e8c14a">✦</text>
    </g>
  );
}

function DoorArt({ slug, cx, floorY, ok }: { slug: string; cx: number; floorY: number; ok: boolean }) {
  const room = roomBySlug(slug)!;
  const top = floorY - DOOR_H;
  return (
    <g className={`door${ok ? "" : " locked"}`}>
      <ellipse cx={cx} cy={floorY + 10} rx="42" ry="6" fill="#8a6a43" opacity=".5" />
      <rect x={cx - DOOR_W / 2 - 6} y={top - 6} width={DOOR_W + 12} height={DOOR_H + 6} rx="8" fill="#6b4a30" />
      <rect className="leaf" x={cx - DOOR_W / 2} y={top} width={DOOR_W} height={DOOR_H} rx="4" fill={room.color} />
      <rect x={cx - 34} y={top + 14} width="68" height="48" rx="5" fill="#fff8e0" opacity=".6" />
      <rect x={cx - 34} y={top + 14} width="68" height="48" rx="5" fill="none" stroke="#0000002e" strokeWidth="2" />
      <text x={cx} y={top + 49} textAnchor="middle" fontSize="28">{ok ? room.icon : "🔒"}</text>
      <rect x={cx - 34} y={top + 74} width="68" height="52" rx="3" fill="none" stroke="#00000026" strokeWidth="2" />
      <circle cx={cx + 38} cy={top + 80} r="4" fill="#f0cf6a" />
      <rect x={cx - 48} y={top - 34} width="96" height="24" rx="7" fill="#2f3a52" />
      <text x={cx} y={top - 17} textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#fff">{room.name}</text>
    </g>
  );
}

export default function AcademyLobby({ role }: { role: string }) {
  return (
    <svg className="lobby" viewBox={`0 0 960 ${VB_H}`} role="group" aria-label="EST 학원 건물. 문을 눌러 각 공간으로 이동합니다. 3층은 명예의 전당입니다.">
      <defs>
        <linearGradient id="a-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9d3ee" /><stop offset="1" stopColor="#f6ecdc" /></linearGradient>
        <linearGradient id="a-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6ecdc" /><stop offset="1" stopColor="#eadcc6" /></linearGradient>
        <linearGradient id="a-hall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8efd4" /><stop offset="1" stopColor="#eedfb2" /></linearGradient>
        <linearGradient id="a-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d3a679" /><stop offset="1" stopColor="#b98c60" /></linearGradient>
      </defs>
      <rect width="960" height={VB_H} fill="url(#a-sky)" />
      <ellipse cx="120" cy="40" rx="50" ry="12" fill="#fff" opacity=".7" /><ellipse cx="160" cy="32" rx="30" ry="10" fill="#fff" opacity=".7" />
      <ellipse cx="840" cy="52" rx="56" ry="13" fill="#fff" opacity=".7" /><ellipse cx="880" cy="44" rx="32" ry="10" fill="#fff" opacity=".7" />

      {/* 지붕 + 간판 */}
      <polygon points="10,72 950,72 912,34 48,34" fill="#5b6b8c" />
      <rect x="10" y="68" width="940" height="8" fill="#46547a" />
      <rect x="350" y="8" width="260" height="40" rx="12" fill="#2f4b8f" />
      <text x="480" y="35" textAnchor="middle" fontSize="21" fontWeight="800" fill="#fff" letterSpacing="2">EST ACADEMY</text>

      {/* 건물 */}
      {FLOORS.map((f) => {
        const wallTop = f.floorY - 190;
        return (
          <g key={f.label} aria-hidden="true">
            <rect x={BX} y={wallTop} width={BW} height={190} fill={f.hall ? "url(#a-hall)" : "url(#a-wall)"} />
            <rect x={BX} y={f.floorY - 40} width={BW} height={40} fill={f.hall ? "#8a3f4f" : "#7d9cc4"} />
            <rect x={BX} y={f.floorY - 44} width={BW} height={6} fill={f.hall ? "#e8c14a" : "#f7f1e6"} />
            <rect x={BX} y={f.floorY} width={BW} height={36} fill="url(#a-floor)" />
            <line x1={BX} x2={BX + BW} y1={f.floorY + 18} y2={f.floorY + 18} stroke="#0000001f" />
            <rect x={BX} y={f.floorY + 36} width={BW} height={16} fill="#6b5a45" />
            <rect x={BX + 8} y={wallTop + 10} width="34" height="20" rx="10" fill={f.hall ? "#b4812a" : "#2f4b8f"} />
            <text x={BX + 25} y={wallTop + 25} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{f.label}</text>
            {f.hall
              ? [0, 1, 2, 3].map((g) => {
                  const gx = (doorX(g) + doorX(g + 1)) / 2;
                  return g === 1 || g === 2 ? null : <Sconce key={g} x={gx} y={f.floorY - 112} />;
                })
              : [0, 1, 2, 3].map((g) => {
                  const gx = (doorX(g) + doorX(g + 1)) / 2;
                  return (
                    <g key={g}>
                      {g % 2 === 0 ? (
                        <>
                          <Sconce x={gx} y={f.floorY - 112} />
                          <Plant x={gx} y={f.floorY - 2} />
                        </>
                      ) : (
                        <Frame x={gx} y={f.floorY - 128} />
                      )}
                    </g>
                  );
                })}
          </g>
        );
      })}
      <rect x={BX - 8} y="72" width="8" height={GROUND_Y - 70} fill="#6b5a45" /><rect x={BX + BW} y="72" width="8" height={GROUND_Y - 70} fill="#6b5a45" />

      {/* 3층 트로피 진열장 */}
      <TrophyCase cx={doorX(0)} floorY={FLOORS[0].floorY} v={0} />
      <TrophyCase cx={doorX(1)} floorY={FLOORS[0].floorY} v={1} />
      <TrophyCase cx={doorX(3)} floorY={FLOORS[0].floorY} v={1} />
      <TrophyCase cx={doorX(4)} floorY={FLOORS[0].floorY} v={2} />

      {/* 문 */}
      {(() => {
        const hall = roomBySlug("hall")!;
        const ok = canEnter(hall, role);
        const art = <HallDoor cx={doorX(2)} floorY={FLOORS[0].floorY} ok={ok} />;
        return ok ? (
          <Link href="/rooms/hall" aria-label="명예의 전당 입장">{art}</Link>
        ) : (
          <g role="img" aria-label="명예의 전당 (출입 제한)">{art}</g>
        );
      })()}
      {FLOORS.slice(1).map((f) =>
        f.rooms!.map((slug, i) => {
          const room = roomBySlug(slug)!;
          const ok = canEnter(room, role);
          const art = <DoorArt slug={slug} cx={doorX(i)} floorY={f.floorY} ok={ok} />;
          return ok ? (
            <Link key={slug} href={`/rooms/${slug}`} aria-label={`${room.name} 입장`}>{art}</Link>
          ) : (
            <g key={slug} role="img" aria-label={`${room.name} (출입 제한)`}>{art}</g>
          );
        }),
      )}

      {/* 바닥 · 조경 */}
      <rect y={GROUND_Y + 2} width="960" height="78" fill="#bcd5a4" />
      <rect y={GROUND_Y + 2} width="960" height="20" fill="#e6dcc6" />
      {[40, 120, 220, 740, 840, 920].map((x) => <ellipse key={x} cx={x} cy={GROUND_Y + 40} rx="26" ry="16" fill="#7fae7a" />)}
      {[40, 220, 840].map((x) => <circle key={x} cx={x + 8} cy={GROUND_Y + 34} r="3" fill="#f4b8b0" />)}
    </svg>
  );
}
