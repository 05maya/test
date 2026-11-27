const BOOK_COLORS = ["#d96c6c", "#e8b04a", "#6aa6a0", "#5b7fbf", "#f0e6d2", "#8e6bb3", "#c9795a", "#7fae7a", "#2f4b8f"];

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

export default function Books({ baseY, x0, x1, seed, gaps = [], hMax = 64 }: { baseY: number; x0: number; x1: number; seed: number; gaps?: [number, number][]; hMax?: number }) {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  let x = x0, i = 0;
  while (x < x1 - 8) {
    const gap = gaps.find(([a, b]) => x >= a && x < b);
    if (gap) { x = gap[1]; continue; }
    const w = 9 + Math.floor(r() * 9);
    const h = 36 + Math.floor(r() * (hMax - 36));
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

