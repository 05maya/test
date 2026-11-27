export const CX = [290, 480, 670];

export function Person({ cx, skin, hair, blazer, kind }: { cx: number; skin: string; hair: string; blazer: string; kind: "bob" | "short" | "long" }) {
  return (
    <g aria-hidden="true">
      <rect x={cx - 50} y={196} width={100} height={140} rx={18} fill="#3b4660" />
      {kind === "long" && <path d={`M${cx - 28} 212Q${cx - 40} 270 ${cx - 32} 292H${cx + 32}Q${cx + 40} 270 ${cx + 28} 212Z`} fill={hair} />}
      <path d={`M${cx - 60} 336Q${cx - 60} 274 ${cx} 268Q${cx + 60} 274 ${cx + 60} 336Z`} fill={blazer} />
      <path d={`M${cx - 14} 268L${cx} 296L${cx + 14} 268Z`} fill="#f7f1e6" />
      {kind === "short" && <path d={`M${cx - 6} 276L${cx} 284L${cx + 6} 276L${cx + 4} 316L${cx} 322L${cx - 4} 316Z`} fill="#b94a52" />}
      <path d={`M${cx - 26} 292L${cx - 14} 268L${cx} 296L${cx - 20} 326Z`} fill="#00000022" />
      <path d={`M${cx + 26} 292L${cx + 14} 268L${cx} 296L${cx + 20} 326Z`} fill="#00000022" />
      <rect x={cx - 8} y={250} width={16} height={20} fill={skin} />
      <circle cx={cx} cy={226} r={27} fill={skin} />
      {kind === "bob" && <path d={`M${cx - 30} 232Q${cx - 34} 192 ${cx} 192Q${cx + 34} 192 ${cx + 30} 232L${cx + 28} 246Q${cx + 22} 214 ${cx} 212Q${cx - 22} 214 ${cx - 28} 246Z`} fill={hair} />}
      {kind === "short" && <path d={`M${cx - 28} 222Q${cx - 30} 194 ${cx} 194Q${cx + 30} 194 ${cx + 28} 222Q${cx + 14} 208 ${cx} 208Q${cx - 14} 208 ${cx - 28} 222Z`} fill={hair} />}
      {kind === "long" && <path d={`M${cx - 30} 236Q${cx - 34} 192 ${cx} 192Q${cx + 34} 192 ${cx + 30} 236Q${cx + 22} 210 ${cx} 208Q${cx - 22} 210 ${cx - 30} 236Z`} fill={hair} />}
    </g>
  );
}
