import Link from "next/link";
import { ROOMS, canEnter, roomBySlug } from "@/lib/rooms";

// 학원 로비를 안쪽에서 바라본 구도 (뒷벽 + 좌/우 벽 + 바닥).
// 문은 방 slug 순서대로 벽에 배치한다.
const BACK = ["english", "math", "korean", "social", "science"];
const LEFT = ["counsel", "parents"];
const RIGHT = ["study", "interview"];

const W = 960, H = 600;
const WALL_X = 160; // 좌/우 벽의 폭
const TOP_BACK = 90, FLOOR_BACK = 430; // 뒷벽 위/아래 y

type Door = { slug: string; pts: [number, number][]; plate: [number, number]; mid: [number, number]; scale: number };

function backDoors(): Door[] {
  const w = 84, gap = (640 - w * BACK.length) / (BACK.length + 1);
  return BACK.map((slug, i) => {
    const x = WALL_X + gap + i * (w + gap), top = 215, bot = FLOOR_BACK;
    return { slug, pts: [[x, bot], [x + w, bot], [x + w, top], [x, top]], plate: [x + w / 2, top - 14], mid: [x + w / 2, (top + bot) / 2], scale: 1 };
  });
}

// 측벽의 원근: 벽 바깥(x=0)일수록 크고, 안쪽(x=WALL_X)일수록 작다.
function sideDoors(slugs: string[], right: boolean): Door[] {
  const floorY = (x: number) => H - ((H - FLOOR_BACK) * x) / WALL_X;
  const topY = (x: number) => (TOP_BACK * x) / WALL_X;
  const spans: [number, number][] = [[22, 66], [88, 128]];
  return slugs.map((slug, i) => {
    const [a, b] = spans[i];
    const hh = (x: number) => floorY(x) - 0.74 * (floorY(x) - topY(x));
    const mx = (x: number) => (right ? W - x : x);
    const pts: [number, number][] = [[mx(a), floorY(a)], [mx(b), floorY(b)], [mx(b), hh(b)], [mx(a), hh(a)]];
    const c = (a + b) / 2;
    return { slug, pts, plate: [mx(c), hh(c) - 12], mid: [mx(c), (floorY(c) + hh(c)) / 2], scale: 1 - (c / WALL_X) * 0.45 };
  });
}

const poly = (pts: [number, number][]) => pts.map((p) => p.join(",")).join(" ");

export default function AcademyLobby({ role }: { role: string }) {
  const doors = [...backDoors(), ...sideDoors(LEFT, false), ...sideDoors(RIGHT, true)];

  return (
    <svg className="lobby" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="EST 학원 로비. 문을 눌러 각 공간으로 이동합니다.">
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c7a6" /><stop offset="1" stopColor="#b99e74" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6efe0" /><stop offset="1" stopColor="#e6dcc6" />
        </linearGradient>
      </defs>

      {/* 천장 / 벽 / 바닥 */}
      <polygon points={`0,0 ${W},0 ${W - WALL_X},${TOP_BACK} ${WALL_X},${TOP_BACK}`} fill="#cfc6b3" />
      <rect x={WALL_X} y={TOP_BACK} width={W - WALL_X * 2} height={FLOOR_BACK - TOP_BACK} fill="url(#wall)" />
      <polygon points={`0,0 ${WALL_X},${TOP_BACK} ${WALL_X},${FLOOR_BACK} 0,${H}`} fill="#ddd2bb" />
      <polygon points={`${W},0 ${W - WALL_X},${TOP_BACK} ${W - WALL_X},${FLOOR_BACK} ${W},${H}`} fill="#d3c8b0" />
      <polygon points={`0,${H} ${WALL_X},${FLOOR_BACK} ${W - WALL_X},${FLOOR_BACK} ${W},${H}`} fill="url(#floor)" />
      {/* 바닥 타일 선 */}
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <line key={t} x1={WALL_X + (W - WALL_X * 2) * t} y1={FLOOR_BACK} x2={W * t} y2={H} stroke="#0002" />
      ))}
      {[0.35, 0.7].map((t) => {
        const y = FLOOR_BACK + (H - FLOOR_BACK) * t, inset = WALL_X * (1 - t);
        return <line key={t} x1={inset} y1={y} x2={W - inset} y2={y} stroke="#0002" />;
      })}
      <line x1={WALL_X} y1={FLOOR_BACK} x2={W - WALL_X} y2={FLOOR_BACK} stroke="#0003" strokeWidth="3" />

      {/* 학원 간판 */}
      <g>
        <rect x={340} y={104} width={280} height={44} rx={8} fill="#2f4b8f" />
        <text x={480} y={133} textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff">🏫 EST ACADEMY</text>
      </g>

      {/* 안내 데스크 */}
      <g aria-hidden="true">
        <ellipse cx={480} cy={540} rx={150} ry={22} fill="#0002" />
        <rect x={350} y={470} width={260} height={64} rx={10} fill="#8a6a43" />
        <rect x={350} y={470} width={260} height={16} rx={8} fill="#a98457" />
        <text x={480} y={518} textAnchor="middle" fontSize="16" fill="#fff" fontWeight="600">안내 데스크</text>
      </g>

      {/* 문 */}
      {doors.map((d) => {
        const room = roomBySlug(d.slug)!;
        const ok = canEnter(room, role);
        const g = (
          <g className={`door${ok ? "" : " locked"}`}>
            <polygon points={poly(d.pts)} fill="#4a3a2a" />
            <polygon className="leaf" points={poly(d.pts)} fill={room.color} stroke="#3b2d20" strokeWidth="4" strokeLinejoin="round" />
            <text x={d.mid[0]} y={d.mid[1] + 8 * d.scale} textAnchor="middle" fontSize={34 * d.scale}>{ok ? room.icon : "🔒"}</text>
            <rect x={d.plate[0] - 46 * d.scale} y={d.plate[1] - 15} width={92 * d.scale} height={22} rx={5} fill="#2b2b33" />
            <text x={d.plate[0]} y={d.plate[1] + 1} textAnchor="middle" fontSize={13 * Math.max(d.scale, 0.8)} fontWeight="700" fill="#fff">{room.name}</text>
          </g>
        );
        return ok ? (
          <Link key={d.slug} href={`/rooms/${d.slug}`} aria-label={`${room.name} 입장`}>{g}</Link>
        ) : (
          <g key={d.slug} role="img" aria-label={`${room.name} (출입 제한)`}>{g}</g>
        );
      })}
    </svg>
  );
}
