import Link from "next/link";
import { canEnter, roomBySlug } from "@/lib/rooms";

// 학원 건물 단면: 2층 복도에 문이 늘어서 있다.
const FLOORS = [
  { label: "2F", floorY: 260, rooms: ["english", "math", "korean", "social", "science"] },
  { label: "1F", floorY: 502, rooms: ["library", "study", "interview", "counsel", "parents"] },
];
const BX = 30, BW = 900; // 건물 x 범위
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
    <svg className="lobby" viewBox="0 0 960 640" role="group" aria-label="EST 학원 건물. 문을 눌러 각 공간으로 이동합니다.">
      <defs>
        <linearGradient id="a-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9d3ee" /><stop offset="1" stopColor="#f6ecdc" /></linearGradient>
        <linearGradient id="a-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6ecdc" /><stop offset="1" stopColor="#eadcc6" /></linearGradient>
        <linearGradient id="a-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d3a679" /><stop offset="1" stopColor="#b98c60" /></linearGradient>
      </defs>
      <rect width="960" height="640" fill="url(#a-sky)" />
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
            <rect x={BX} y={wallTop} width={BW} height={190} fill="url(#a-wall)" />
            <rect x={BX} y={f.floorY - 40} width={BW} height={40} fill="#7d9cc4" />
            <rect x={BX} y={f.floorY - 44} width={BW} height={6} fill="#f7f1e6" />
            <rect x={BX} y={f.floorY} width={BW} height={36} fill="url(#a-floor)" />
            <line x1={BX} x2={BX + BW} y1={f.floorY + 18} y2={f.floorY + 18} stroke="#0000001f" />
            <rect x={BX} y={f.floorY + 36} width={BW} height={16} fill="#6b5a45" />
            <rect x={BX + 8} y={wallTop + 10} width="34" height="20" rx="10" fill="#2f4b8f" />
            <text x={BX + 25} y={wallTop + 25} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{f.label}</text>
            {[0, 1, 2, 3].map((g) => {
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
      <rect x={BX - 8} y="72" width="8" height="490" fill="#6b5a45" /><rect x={BX + BW} y="72" width="8" height="490" fill="#6b5a45" />

      {/* 문 */}
      {FLOORS.map((f) =>
        f.rooms.map((slug, i) => {
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
      <rect y="562" width="960" height="78" fill="#bcd5a4" />
      <rect y="562" width="960" height="20" fill="#e6dcc6" />
      {[40, 120, 220, 740, 840, 920].map((x) => <ellipse key={x} cx={x} cy={600} rx="26" ry="16" fill="#7fae7a" />)}
      {[40, 220, 840].map((x) => <circle key={x} cx={x + 8} cy={594} r="3" fill="#f4b8b0" />)}
    </svg>
  );
}
