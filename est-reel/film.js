// THE FILM: EST 숏폼 드라마 EP.01 《수행평가 지옥 탈출》 (9:16, black + gold).
// A list of shots (Shots.film); every frame is a pure function of t. The student's mouth moves with the
// real voiceover (out/voice.json). There are no subtitles: the words are spoken. The only text on screen
// is part of the picture (notification cards, stamps, the checklist, the logo).
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, Subs = globalThis.Subs, Shots = globalThis.Shots, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const { T, ev, BEAT } = S;
  const W = G.W, H = G.H;
  let VO = null;

  const BLACK = '#0A0A0D', GOLD = '#F2B84B', GOLD2 = '#FFD98A', GOLD3 = '#9A6B1E', CREAM = '#F6F0E2', RED = '#E0503E';
  const KID = { outfit: 'suit', robe: '#16161C', trim: GOLD, shirt: '#F4F1EA', skin: '#F1CFAE', hairStyle: 'short', hair: '#17171B', bottoms: 'pants', shoes: '#111111', build: 'slim' };
  globalThis.CAST = { student: KID }; // render.js cast auditions this

  // ---------- helpers ----------
  // the flat style draws no outlines: rounded rects and ellipses get a crisp gold/ink stroke drawn on top
  const rr = (ctx, x, y, w, h, r, o = {}) => {
    G.rrect(ctx, x, y, w, h, r, { ...o, stroke: undefined });
    if (o.stroke && o.lw) { ctx.save(); ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke(); ctx.restore(); }
  };
  const el = (ctx, cx, cy, rx, ry, o = {}) => {
    G.ellipse(ctx, cx, cy, rx, ry, { ...o, stroke: undefined });
    if (o.stroke && o.lw) { ctx.save(); ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  };
  const talk = (t) => { const mm = VO && Subs.mouth(VO, t, 'kid'); return mm && mm.talking ? mm : null; };
  const shakeXY = (t, t0, dur, amp) => { const k = t - t0; if (k < 0 || k > dur) return [0, 0]; const a = amp * (1 - k / dur); return [Math.sin(k * 90) * a, Math.cos(k * 77) * a]; };
  const focus = (px, py, zoom) => ({ x: clamp(px, W / (2 * zoom), W - W / (2 * zoom)) - W / 2, y: clamp(py, H / (2 * zoom), H - H / (2 * zoom)) - H / 2, zoom });
  function student(ctx, t, o = {}) {
    const mm = talk(t);
    Ch.person(ctx, { x: 540, y: 1330, s: 1.9, pose: 'sit', style: KID, seed: 11, shadow: false, ...o, mouth: mm || o.mouth || 'flat' });
  }
  function stamp(ctx, str, x, y, t, t0, { size = 110, color = GOLD, rot = -0.05 } = {}) {
    if (t < t0) return;
    const pop = ease.outBack(clamp((t - t0) / 0.2), 2.6);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(pop, pop);
    G.text(ctx, str, 0, 0, { size, align: 'center', color, stroke: BLACK, strokeW: Math.round(size * 0.16), fam: 'Bungee', weight: 400 });
    ctx.restore();
  }
  function impact(ctx, t, t0, cx = 540, cy = 900) {
    const a = t - t0;
    ctx.fillStyle = BLACK; ctx.fillRect(0, 0, W, H);
    G.rays(ctx, cx, cy, { n: 30, r0: 140, r1: 1900, color: GOLD, lw: 16, spin: a * 0.4 });
    G.rays(ctx, cx, cy, { n: 18, r0: 260, r1: 1900, color: GOLD2, lw: 8, spin: -a * 0.3, alpha: 0.7 });
    const fl = Math.exp(-a * 14);
    ctx.fillStyle = `rgba(255,245,220,${0.9 * fl})`; ctx.fillRect(0, 0, W, H);
  }
  function glow(ctx, x, y, r, a, col = '255,200,90') {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  }
  // a gold-edged black card with a header bar and text lines
  function docCard(ctx, x, y, w, h, rot, seed, label) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    rr(ctx, -w / 2, -h / 2, w, h, 12, { fill: '#14110C', stroke: GOLD, lw: 4, seed });
    rr(ctx, -w / 2 + 14, -h / 2 + 16, w - 28, 12, 5, { fill: GOLD, lw: 0, seed: seed + 1 });
    for (let k = 0; k < 5; k++) rr(ctx, -w / 2 + 14, -h / 2 + 48 + k * 22, (w - 28) * (k % 3 === 2 ? 0.6 : 1), 8, 4, { fill: GOLD3, lw: 0, seed: seed + 2 + k });
    if (label) G.text(ctx, label, 0, h / 2 - 26, { size: Math.max(20, w * 0.13), align: 'center', color: GOLD2, weight: 700 });
    ctx.restore();
  }

  // ---------- the room: a dark study, a gold-trimmed shelf with a glowing seam, a window, a lamp ----------
  const BOOKS = ['#7A2E36', '#26365E', '#2F5C45', GOLD3, '#5A3B7A', '#C9A14A'];
  function shelfHalf(ctx, x0, w, y0, h, side) {
    rr(ctx, x0, y0, w, h, 6, { fill: '#1C140E', stroke: GOLD3, lw: 4, seed: 40 + side });
    for (let r = 0; r < 6; r++) {
      const yy = y0 + r * (h / 6);
      rr(ctx, x0, yy + h / 6 - 14, w, 14, 3, { fill: '#2A1D12', stroke: GOLD3, lw: 2, seed: 50 + r + side * 7 });
      for (let k = 0; k < 4; k++) {
        const bx = x0 + 12 + k * 34, bh = 90 + Math.floor(G.rnd(r, k, side) * 50);
        if (bx + 28 > x0 + w) continue;
        rr(ctx, bx, yy + h / 6 - 14 - bh, 28, bh, 4, { fill: BOOKS[(r * 3 + k * 2 + side) % 6], lw: 0, seed: 60 + r * 5 + k });
        rr(ctx, bx + 4, yy + h / 6 - 14 - bh + 14, 20, 5, 2, { fill: GOLD, lw: 0, seed: 70 + k });
      }
    }
  }
  function room(ctx, t, { so = 0, leak = 0, dim = 0, bookOut = false } = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#07070A'); g.addColorStop(0.55, '#120E0B'); g.addColorStop(1, '#1D140B');
    ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
    for (let k = 0; k < 4; k++) G.line(ctx, [[420 + k * 110, 300], [420 + k * 110, 1300]], { color: 'rgba(242,184,75,0.06)', lw: 3, seed: 90 + k });
    // the window with a gold frame, a moon and a bokeh city
    rr(ctx, 790, 340, 250, 430, 10, { fill: '#05060C', stroke: GOLD3, lw: 8, seed: 100 });
    G.line(ctx, [[915, 340], [915, 770]], { color: GOLD3, lw: 6, seed: 101 }); G.line(ctx, [[790, 555], [1040, 555]], { color: GOLD3, lw: 6, seed: 102 });
    el(ctx, 980, 410, 26, 26, { fill: GOLD2, lw: 0, seed: 103 });
    for (let i = 0; i < 18; i++) { const bx = 810 + G.rnd(i, 1) * 210, by = 600 + G.rnd(i, 2) * 150; el(ctx, bx, by, 4 + G.rnd(i, 3) * 6, 4 + G.rnd(i, 3) * 6, { fill: i % 3 ? GOLD : '#FFF1C8', lw: 0, seed: 110 + i, alpha: 0.8 }); }
    // the shelf: a portal behind two sliding halves
    const sx = 36, sw = 300, sy = 360, sh = 980, half = sw / 2;
    if (so > 0.001) {
      const pg = ctx.createLinearGradient(sx, 0, sx + sw, 0); pg.addColorStop(0, '#FFF8E0'); pg.addColorStop(1, '#FFD98A');
      ctx.fillStyle = pg; ctx.fillRect(sx, sy, sw, sh);
      for (let k = 0; k < 6; k++) G.line(ctx, [[sx + 40 + k * 44, sy + 30], [sx + 70 + k * 44 + Math.sin(t * 2 + k) * 20, sy + sh - 30]], { color: 'rgba(255,255,255,0.55)', lw: 10, seed: 120 + k });
    }
    const slide = ease.outCubic(so) * (half + 6);
    ctx.save(); ctx.translate(-slide, 0); shelfHalf(ctx, sx, half, sy, sh, 0); ctx.restore();
    ctx.save(); ctx.translate(slide, 0); shelfHalf(ctx, sx + half, half, sy, sh, 1); ctx.restore();
    if (!bookOut && so < 0.05) { // the golden EST book
      const bx = sx + 112, by = sy + 2 * (sh / 6) + 36;
      rr(ctx, bx, by, 34, sh / 6 - 50, 4, { fill: GOLD, stroke: GOLD3, lw: 3, seed: 130 });
      G.text(ctx, 'EST', bx + 17, by + (sh / 6 - 50) / 2, { size: 20, align: 'center', color: '#3A2406', fam: 'Bungee', weight: 400 });
    }
    // the gold line that leaks from the seam
    if (leak > 0.001 && so < 0.05) {
      glow(ctx, sx + half, sy + sh * 0.5, 120 + 340 * leak, 0.55 * leak);
      ctx.fillStyle = `rgba(255,226,150,${0.35 + 0.65 * leak})`; ctx.fillRect(sx + half - 2 - 4 * leak, sy, 4 + 8 * leak, sh);
      glow(ctx, 540, 1300, 500, 0.25 * leak);
    }
    if (dim > 0) { ctx.fillStyle = `rgba(4,4,8,${dim})`; ctx.fillRect(-400, -400, W + 800, H + 800); if (leak > 0.001) glow(ctx, sx + half, 800, 420 * leak + 80, 0.5 * leak); }
    glow(ctx, 900, 1060, 520, 0.14 * (1 - dim)); // the desk lamp's warm spill
  }
  function crumples(ctx, t) {
    ev.papers.forEach((t0, i) => {
      const k = t - t0 + 0.4; // thrown 0.4s before it lands
      if (k < 0) return;
      const land = [140 + (i % 4) * 46, 1352 + (i % 2) * 14];
      const u = clamp(k / 0.4), x = lerp(520, land[0], ease.outQuad(u)), y = lerp(1100, land[1], u) - Math.sin(Math.PI * u) * 150 + (u >= 1 ? 0 : 0);
      G.poly(ctx, [[x - 26, y - 4], [x - 10, y - 26], [x + 14, y - 22], [x + 28, y], [x + 12, y + 24], [x - 14, y + 22]], { fill: '#EDE6D4', stroke: GOLD3, lw: 3, seed: 140 + i, step: 12 });
    });
  }
  function desk(ctx, t, { buzz = 0, laptopGlow = 0 } = {}) {
    rr(ctx, -20, 1330, W + 40, 70, 4, { fill: '#2D1F13', stroke: GOLD3, lw: 4, seed: 150 });
    rr(ctx, -20, 1400, W + 40, 700, 0, { fill: '#100B07', lw: 0, seed: 151 });
    rr(ctx, 80, 1450, 920, 360, 12, { fill: '#17100A', stroke: GOLD3, lw: 3, seed: 152 });
    rr(ctx, 460, 1600, 160, 28, 14, { fill: GOLD, lw: 0, seed: 153 });
    // the laptop, seen from behind, with a gold logo
    rr(ctx, 380, 1170, 320, 170, 12, { fill: '#1D1E26', stroke: '#4A4636', lw: 4, seed: 154 });
    el(ctx, 540, 1255, 20, 20, { fill: GOLD, lw: 0, seed: 155 });
    if (laptopGlow > 0) glow(ctx, 540, 1090, 360, 0.2 * laptopGlow, '210,220,255');
    // the books, the mug, the lamp
    for (let i = 0; i < 3; i++) rr(ctx, 70 + i * 6, 1296 - i * 30, 200 - i * 14, 30, 5, { fill: [GOLD3, '#4A1E26', '#1C2A4E'][i], stroke: GOLD, lw: 2, seed: 160 + i });
    rr(ctx, 960, 1280, 56, 52, 8, { fill: '#25252E', stroke: GOLD3, lw: 3, seed: 165 });
    G.line(ctx, [[880, 1330], [858, 1190], [900, 1100]], { color: GOLD, lw: 9, seed: 166 });
    G.poly(ctx, [[850, 1088], [960, 1108], [930, 1158], [862, 1146]], { fill: '#3B2A0E', stroke: GOLD, lw: 3, seed: 167 });
    // the phone
    const vx = buzz > 0 ? Math.sin(t * 90) * 5 * buzz : 0;
    rr(ctx, 745 + vx, 1344, 130, 62, 12, { fill: '#101014', stroke: buzz > 0 ? GOLD : GOLD3, lw: 4, seed: 170 });
    if (buzz > 0) { rr(ctx, 756 + vx, 1354, 108, 42, 8, { fill: GOLD2, lw: 0, seed: 171 }); glow(ctx, 810, 1340, 200, 0.5 * buzz); }
    crumples(ctx, t);
  }
  function notifCard(ctx, x, y, w, app, title, t, t0, { color = GOLD, out = 0, sc = 1 } = {}) {
    if (t < t0) return;
    const p = ease.outBack(clamp((t - t0) / 0.3), 2.4), ox = out * W;
    ctx.save(); ctx.translate(x + w / 2 + ox, y + 70); ctx.scale(p * sc, p * sc);
    rr(ctx, -w / 2, -70, w, 140, 30, { fill: '#101014', stroke: color, lw: 5, seed: 180 });
    el(ctx, -w / 2 + 70, 0, 38, 38, { fill: color, lw: 0, seed: 181 });
    G.text(ctx, '!', -w / 2 + 70, 2, { size: 52, align: 'center', color: '#1A1204', fam: 'Bungee', weight: 400, baseline: 'middle' });
    G.text(ctx, app, -w / 2 + 130, -24, { size: 28, color: GOLD2, weight: 700, baseline: 'middle' });
    G.text(ctx, title, -w / 2 + 130, 24, { size: 50, color: CREAM, weight: 700, baseline: 'middle' });
    ctx.restore();
  }

  // ---------- shots ----------
  // 1. hell begins: three notifications in a row
  function notifs(ctx, t) {
    room(ctx, t);
    const [sx, sy] = shakeXY(t, ev.notif[2], 0.5, 8);
    ctx.save(); ctx.translate(sx, sy);
    const n = ev.notif.filter((q) => t >= q).length;
    student(ctx, t, { gesture: n >= 2 ? 'facepalm' : 'typing', eyes: n >= 1 ? 'wide' : 'normal', brows: n >= 1 ? 'worried' : 'neutral', sweat: n >= 2 ? 0.8 : 0, mouth: n >= 3 ? 'open' : 'flat', look: -0.3 });
    desk(ctx, t, { buzz: ev.notif.some((q) => t >= q && t < q + 0.45) ? 1 : 0, laptopGlow: 1 });
    const out = ease.inCubic(clamp((t - T(2, 2)) / 0.6));
    [['국어', '탐구 발표'], ['영어', '주제 보고서'], ['생명과학', '실험 설계']].forEach(([a, b], i) => notifCard(ctx, 150, 240 + i * 135, 780, a, b, t, ev.notif[i], { out, sc: 0.8 }));
    ctx.restore();
    if (t < T(0, 3)) { const k = clamp((t - 0.1) / 0.5); G.text(ctx, '수행평가 지옥', 540, 150, { size: 92, align: 'center', color: GOLD, stroke: BLACK, strokeW: 14, alpha: k * (1 - clamp((t - T(0, 2)) / 0.4)), weight: 700 }); }
  }
  // 2. the obvious topic: search results struck out, papers crumpled on 8ths
  function search(ctx, t) {
    room(ctx, t);
    const k = t - ev.search;
    student(ctx, t, { gesture: 'typing', eyes: 'normal', brows: k > 1.5 ? 'worried' : 'neutral', mouth: 'flat', look: 0.3, sweat: k > 1.5 ? 0.5 : 0 });
    desk(ctx, t, { laptopGlow: 1 });
    // the search bar and the three obvious results
    const p = ease.outBack(clamp(k / 0.35), 2);
    ctx.save(); ctx.translate(540, 300); ctx.scale(p, p);
    rr(ctx, -400, -55, 800, 110, 55, { fill: '#101014', stroke: GOLD, lw: 5, seed: 200 });
    G.text(ctx, '탐구 주제 추천', -340, 0, { size: 56, color: CREAM, weight: 700, baseline: 'middle' });
    ctx.restore();
    ['AI와 윤리', '미세플라스틱', '기후 변화'].forEach((s, i) => {
      const t0 = ev.papers[i * 2 + 0] - 0.25, u = ease.outBack(clamp((t - t0 + 0.6) / 0.3), 2);
      if (t - t0 + 0.6 < 0) return;
      ctx.save(); ctx.translate(540, 430 + i * 100); ctx.scale(u, u);
      rr(ctx, -330, -40, 660, 80, 22, { fill: '#14110C', stroke: GOLD3, lw: 4, seed: 210 + i });
      G.text(ctx, s, 0, 0, { size: 44, align: 'center', color: CREAM, weight: 700, baseline: 'middle' });
      const x = clamp((t - ev.papers[i * 2]) / 0.2);
      if (x > 0) G.line(ctx, [[-300, 0], [-300 + 600 * x, 0]], { color: RED, lw: 10, seed: 220 + i });
      ctx.restore();
    });
  }
  // 3-6. four difficulties, one bar each
  function diff(i) {
    return (ctx, t) => {
      room(ctx, t);
      const t0 = ev.diff[i], k = t - t0;
      const acts = [
        { gesture: 'think', eyes: 'normal', brows: 'worried', mouth: 'wavy', sweat: 0.3, look: 0.4 },
        { gesture: 'facepalm', eyes: 'closed', brows: 'worried', mouth: 'wavy', sweat: 0.6 },
        { gesture: 'shrug', eyes: 'wide', brows: 'up', mouth: 'o', sweat: 0.4, look: -0.5 },
        { gesture: 'facepalm', eyes: 'wide', brows: 'worried', mouth: 'open', sweat: 1 },
      ][i];
      student(ctx, t, acts);
      desk(ctx, t, { laptopGlow: 1 });
      const bob = Math.sin(t * 3) * 8;
      if (i === 0) for (let q = 0; q < 6; q++) { const a = t * 1.4 + q * 1.05; stamp(ctx, '?', 540 + Math.cos(a) * 330, 560 + Math.sin(a * 1.3) * 80 + bob, t, t0 + q * 0.1, { size: 110 + (q % 3) * 24, color: q % 2 ? GOLD : GOLD2, rot: Math.sin(a) * 0.3 }); }
      if (i === 1) { // a blank blueprint, a beaker, scribbles that don't make sense
        ctx.save(); ctx.translate(540, 560); ctx.rotate(-0.04); ctx.scale(0.72, 0.72);
        rr(ctx, -300, -170, 600, 340, 14, { fill: '#14110C', stroke: GOLD, lw: 5, seed: 230 });
        for (let r = 0; r < 4; r++) G.line(ctx, [[-260, -110 + r * 56], [-260 + 520 * clamp((k - 0.2 * r) / 0.4) * (r === 3 ? 0.4 : 1), -110 + r * 56 + (r % 2 ? 10 : -6)]], { color: GOLD3, lw: 6, seed: 231 + r });
        el(ctx, 190, 70, 56, 18, { fill: GOLD2, lw: 0, seed: 240 }); rr(ctx, 150, -70, 80, 140, 10, { fill: 'rgba(242,184,75,0.35)', stroke: GOLD, lw: 4, seed: 241 });
        ctx.restore();
        stamp(ctx, '???', 800, 470, t, t0 + 0.4, { size: 90, color: RED });
      }
      if (i === 2) { // an empty folder, 404
        ctx.save(); ctx.translate(540, 570); ctx.scale(0.75, 0.75);
        G.poly(ctx, [[-260, -150], [-80, -150], [-30, -100], [260, -100], [260, 170], [-260, 170]], { fill: '#14110C', stroke: GOLD, lw: 6, seed: 250 });
        G.text(ctx, '404', 0, 20, { size: 150, align: 'center', color: GOLD, fam: 'Bungee', weight: 400, baseline: 'middle', stroke: BLACK, strokeW: 14 });
        const m = Math.sin(t * 2.5) * 30; el(ctx, 180 + m, -40, 46, 46, { fill: 'rgba(255,217,138,0.2)', stroke: GOLD2, lw: 8, seed: 251 }); G.line(ctx, [[212 + m, -8], [262 + m, 40]], { color: GOLD2, lw: 14, seed: 252 });
        ctx.restore();
      }
      if (i === 3) { // the clock spins, D-3
        const cx = 300, cy = 560;
        el(ctx, cx, cy, 150, 150, { fill: '#101014', stroke: RED, lw: 14, seed: 260 });
        for (let q = 0; q < 12; q++) { const a = q * Math.PI / 6; G.line(ctx, [[cx + Math.sin(a) * 124, cy - Math.cos(a) * 124], [cx + Math.sin(a) * 140, cy - Math.cos(a) * 140]], { color: GOLD2, lw: 6, seed: 261 + q }); }
        const a = k * 14; G.line(ctx, [[cx, cy], [cx + Math.sin(a) * 118, cy - Math.cos(a) * 118]], { color: GOLD, lw: 10, seed: 280 }); G.line(ctx, [[cx, cy], [cx + Math.sin(a / 12) * 80, cy - Math.cos(a / 12) * 80]], { color: CREAM, lw: 14, seed: 281 });
        stamp(ctx, 'D-3', 760, 580, t, t0 + 0.2, { size: 150, color: RED });
      }
      // the label slams in on the downbeat
      stamp(ctx, ['주제 선정', '실험 설계', '자료 부족', '시간 부족'][i], 540, 360, t, t0, { size: 96, color: GOLD });
    };
  }
  // 7. the collapse: head on the desk, a gold line leaks from the shelf
  function slump(ctx, t) {
    const k = t - ev.slump, leak = clamp((t - ev.leak) / (ev.drop - 0.25 - ev.leak));
    room(ctx, t, { leak: ease.inQuad(leak), dim: 0.45 });
    const look = clamp((t - T(10, 2)) / 0.4);
    student(ctx, t, { y: 1330 + 70 * ease.outCubic(clamp(k / 0.5)) * (1 - look), eyes: look > 0.5 ? 'wide' : 'closed', brows: 'worried', mouth: look > 0.5 ? 'o' : 'wavy', headRot: lerp(0.28, -0.05, look), headY: lerp(60, 0, look), look: -1 * look, sweat: 0.3 });
    desk(ctx, t, { laptopGlow: 0.3 });
    ctx.fillStyle = `rgba(4,4,8,${0.25 * (1 - look)})`; ctx.fillRect(0, 0, W, H);
  }
  // 8. DROP: the golden book is pulled; the impact frame
  function book(ctx, t) {
    const a = t - ev.drop;
    impact(ctx, t, ev.drop);
    const sc = lerp(0.4, 1.1, ease.outBack(clamp(a / 0.35), 2.5));
    ctx.save(); ctx.translate(540, 940); ctx.rotate(-0.08); ctx.scale(sc, sc);
    rr(ctx, -170, -250, 340, 500, 18, { fill: GOLD, stroke: GOLD3, lw: 10, seed: 300 });
    rr(ctx, -140, -220, 280, 440, 10, { fill: 'rgba(0,0,0,0)', stroke: '#3A2406', lw: 5, seed: 301 });
    G.text(ctx, 'EST', 0, -20, { size: 150, align: 'center', color: '#3A2406', fam: 'Bungee', weight: 400, baseline: 'middle' });
    G.line(ctx, [[-90, 90], [90, 90]], { color: '#3A2406', lw: 8, seed: 302 });
    ctx.restore();
    const pop = ease.outBack(clamp(a / 0.15), 2.6);
    ctx.save(); ctx.translate(540, 360); ctx.rotate(-0.1); ctx.scale(pop, pop);
    G.text(ctx, '콰아아앙!', 0, 0, { size: 170, align: 'center', color: GOLD2, stroke: BLACK, strokeW: 20, weight: 700 });
    ctx.restore();
  }
  // 9. the archive: the shelf opens, documents pour out, EST SECRET ARCHIVE is stamped on 8ths
  const CARDS = Array.from({ length: 16 }, (_, i) => ({ x: (i % 2 ? 790 : 80) + G.rnd(i, 1) * 210, y: 520 + G.rnd(i, 2) * 760, d: 0.55 + G.rnd(i, 3) * 0.75, r: (G.rnd(i, 4) - 0.5) * 0.7, l: ['탐구보고서', '실험 자료', '교과 연계', '세특 사례', '발표 자료', '개념 정리'][i % 6] }));
  function floating(ctx, t, t0, links = 0) {
    const pts = CARDS.map((c, i) => {
      const u = ease.outCubic(clamp((t - t0 - i * 0.04) / 0.9)), bob = Math.sin(t * 1.2 + i) * 18 * c.d;
      return [lerp(186, c.x, u), lerp(860, c.y + bob, u), c, u];
    });
    if (links > 0) pts.slice(0, Math.floor(links * (pts.length - 1))).forEach((p, i) => G.line(ctx, [[p[0], p[1]], [pts[i + 1][0], pts[i + 1][1]]], { color: 'rgba(255,217,138,0.55)', lw: 3, seed: 320 + i }));
    pts.sort((a, b) => a[2].d - b[2].d).forEach(([x, y, c, u]) => { ctx.save(); ctx.globalAlpha = Math.min(1, u * 1.4); docCard(ctx, x, y, 170 * c.d, 220 * c.d, c.r + Math.sin(t + c.x) * 0.06, Math.floor(c.x), c.l); ctx.restore(); });
  }
  function archive(ctx, t) {
    const k = t - ev.drop;
    const so = clamp((t - ev.drop) / 0.3);
    room(ctx, t, { so, bookOut: true });
    glow(ctx, 186, 860, 700, 0.7); glow(ctx, 540, 900, 900, 0.18);
    floating(ctx, t, ev.drop + 0.2);
    const stunned = clamp((t - T(11, 3)) / 0.5);
    student(ctx, t, { eyes: 'wide', brows: 'up', mouth: 'o', lookY: -1, look: -0.5, gesture: t > T(13, 0.3) ? 'cheer' : null, sweat: 0.2 });
    desk(ctx, t, { laptopGlow: 0.2 });
    // EST SECRET ARCHIVE: one letter per 8th
    ['E', 'S', 'T'].forEach((ch, i) => stamp(ctx, ch, 380 + i * 160, 300, t, ev.title + i * BEAT / 2, { size: 190, color: GOLD, rot: (i - 1) * 0.05 }));
    stamp(ctx, 'SECRET ARCHIVE', 540, 450, t, ev.title + 1.5 * BEAT, { size: 80, color: CREAM, rot: 0 });
    ctx.fillStyle = `rgba(255,248,224,${0.9 * Math.exp(-k * 7)})`; ctx.fillRect(0, 0, W, H);
  }
  // 10. level-up: three finds fly out of the shelf to the student; the HUD links them into a map
  const FIND = [['생', '생명과학', '자료 발견!'], ['화', '화학 자료와', '연결!'], ['교', '교과 연계', '자료 발견!']];
  function levelup(ctx, t) {
    const so = ease.outCubic(clamp((T(19, 2) + 0.8 - t) / 0.8)) * (t >= ev.check[0] ? 1 : 1);
    room(ctx, t, { so: t < T(19, 2) ? 1 : so, bookOut: true });
    glow(ctx, 186, 860, 600, 0.5);
    floating(ctx, t, ev.items[0] - 0.5, clamp((t - ev.items[0]) / 8));
    const idx = ev.items.filter((q) => t >= q).length - 1;
    student(ctx, t, { gesture: idx === 1 ? 'typing' : t >= ev.check[0] ? 'cheer' : 'cheer', eyes: 'happy', brows: 'up', blush: 0.5, mouth: 'smile', headRot: Math.sin(t * 5) * 0.03 });
    desk(ctx, t, { laptopGlow: 1 });
    // the HUD: three nodes + links
    const slots = [[200, 300], [540, 260], [880, 300]];
    FIND.forEach(([ic, a, b], i) => {
      const t0 = ev.items[i];
      if (t < t0 || t >= ev.check[0] - 0.4) return;
      const k = t - t0, u = clamp(k / 0.5);
      if (i > 0 && u > 0) G.line(ctx, [slots[i - 1], [lerp(slots[i - 1][0], slots[i][0], u), lerp(slots[i - 1][1], slots[i][1], u)]], { color: GOLD, lw: 6, seed: 340 + i });
      el(ctx, slots[i][0], slots[i][1], 70, 70, { fill: '#101014', stroke: GOLD, lw: 8, seed: 350 + i });
      G.text(ctx, ic, slots[i][0], slots[i][1] + 2, { size: 78, align: 'center', color: GOLD, weight: 700, baseline: 'middle' });
      // the big label (first ~1.4s of each find)
      if (k < 1.5) {
        const p = ease.outBack(clamp(k / 0.25), 2.4) * clamp((1.5 - k) / 0.2);
        ctx.save(); ctx.translate(540, 470); ctx.scale(p * 0.85, p * 0.85);
        rr(ctx, -400, -110, 800, 220, 36, { fill: '#101014', stroke: GOLD, lw: 6, seed: 360 + i });
        G.text(ctx, a, 0, -40, { size: 78, align: 'center', color: CREAM, weight: 700, baseline: 'middle' });
        G.text(ctx, b, 0, 50, { size: 78, align: 'center', color: GOLD, weight: 700, baseline: 'middle' });
        ctx.restore();
      }
      // the doc flies from the shelf to the student's hand
      if (k < 0.5) docCard(ctx, lerp(186, 540, ease.outQuad(u)), lerp(860, 1050, u) - Math.sin(Math.PI * u) * 260, 150 * (1 + u * 0.3), 200 * (1 + u * 0.3), (1 - u) * 0.6, 370 + i, null);
    });
    // the checklist
    if (t >= ev.check[0] - 0.4) {
      const p = ease.outBack(clamp((t - (ev.check[0] - 0.4)) / 0.3), 2);
      ctx.save(); ctx.translate(540, 410); ctx.scale(p, p);
      rr(ctx, -420, -130, 840, 330, 40, { fill: '#0E0E12', stroke: GOLD, lw: 7, seed: 380 });
      ['탐구 주제 선정', '실험 설계', '교과 연계'].forEach((s, i) => {
        const y = -60 + i * 90, c = clamp((t - ev.check[i]) / 0.25);
        rr(ctx, -360, y - 32, 64, 64, 12, { fill: 'rgba(0,0,0,0)', stroke: GOLD, lw: 6, seed: 381 + i });
        if (c > 0) { const a1 = Math.min(1, c * 2), a2 = Math.max(0, c * 2 - 1); G.line(ctx, [[-346, y], [lerp(-346, -324, a1), lerp(y, y + 24, a1)]], { color: GOLD, lw: 14, seed: 390 + i }); if (a2 > 0) G.line(ctx, [[-324, y + 24], [lerp(-324, -292, a2), lerp(y + 24, y - 24, a2)]], { color: GOLD, lw: 14, seed: 395 + i }); }
        G.text(ctx, s, -250, y, { size: 56, color: c > 0.3 ? CREAM : '#8A7A55', weight: 700, baseline: 'middle' });
      });
      ctx.restore();
      if (t >= ev.check[0]) G.confetti(ctx, t, ev.check[0], { n: 70, seed: 7 });
    }
  }
  // 11. the twist: one more assignment
  function twist(ctx, t) {
    const k = t - ev.twist, hit = t >= ev.twist;
    room(ctx, t, { dim: hit ? 0.15 : 0, leak: clamp((t - T(21, 1)) / (ev.open - T(21, 1))) });
    const turn = clamp((t - T(21)) / 0.5);
    student(ctx, t, hit ? { eyes: turn > 0 ? 'normal' : 'wide', brows: turn > 0 ? 'determined' : 'worried', mouth: turn > 0 ? 'flat' : 'o', sweat: 1, look: -turn, headRot: -0.06 * turn, gesture: null } : { gesture: 'typing', eyes: 'happy', mouth: 'smile', blush: 0.4 });
    desk(ctx, t, { buzz: hit && k < 0.5 ? 1 : 0, laptopGlow: 0.6 });
    if (hit) {
      const [sx, sy] = shakeXY(t, ev.twist + 0.1, 1, 12);
      ctx.save(); ctx.translate(sx, sy);
      notifCard(ctx, 150, 300, 780, '수학', '수행평가 추가 공지', t, ev.twist, { color: RED, sc: 0.85 });
      stamp(ctx, '!!', 540, 620, t, ev.twist + 0.35, { size: 150, color: RED });
      ctx.restore();
      // the frozen moment: drained of colour, then it comes back as he turns to the shelf
      ctx.save(); ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.85 * (1 - turn); ctx.fillStyle = '#7A7A7A'; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
  }
  // 12. FINALE: the archive bursts open again, then the logo
  function finale(ctx, t) {
    const a = t - ev.finale;
    if (a < 0.9) { impact(ctx, t, ev.finale); const pop = ease.outBack(clamp(a / 0.15), 2.6); ctx.save(); ctx.translate(540, 900); ctx.scale(pop, pop); G.text(ctx, '콰아아앙!', 0, 0, { size: 170, align: 'center', color: GOLD2, stroke: BLACK, strokeW: 20, weight: 700 }); ctx.restore(); return; }
    ctx.fillStyle = BLACK; ctx.fillRect(0, 0, W, H);
    glow(ctx, 540, 860, 800, 0.55 + 0.05 * Math.sin(t * 3)); glow(ctx, 540, 860, 400, 0.4);
    G.rays(ctx, 540, 860, { n: 24, r0: 360, r1: 1500, color: 'rgba(242,184,75,0.35)', lw: 12, spin: a * 0.15 });
    ['E', 'S', 'T'].forEach((ch, i) => stamp(ctx, ch, 330 + i * 210, 860, t, ev.finale + 1.0 + i * BEAT / 2, { size: 330, color: GOLD, rot: (i - 1) * 0.04 }));
    const w = 560 * ease.outCubic(clamp((t - (ev.finale + 2.4)) / 0.6));
    rr(ctx, 540 - w / 2, 1060, w, 10, 5, { fill: GOLD, lw: 0, seed: 400 });
    const p = clamp((t - (ev.tag - 0.1)) / 0.7);
    G.text(ctx, '수행평가의 히든카드', 540, 1190, { size: 82, align: 'center', color: CREAM, weight: 700, alpha: p, stroke: BLACK, strokeW: 10 });
  }

  const film = Shots.film([
    { at: 0, draw: notifs, cam: (s) => Shots.combine(Shots.push(1, 1.1), Shots.handheld(4))(s) },
    { at: ev.search, draw: search, in: 'cut', cam: (s) => ({ ...focus(540, 1000, 1.15 + 0.18 * ease.inOutQuad(s.u)) }) },
    { at: ev.diff[0], draw: diff(0), in: 'cut', cam: Shots.push(1.0, 1.12) },
    { at: ev.diff[1], draw: diff(1), in: 'cut', cam: Shots.push(1.12, 1.0) },
    { at: ev.diff[2], draw: diff(2), in: 'cut', cam: Shots.push(1.0, 1.12) },
    { at: ev.diff[3], draw: diff(3), in: 'cut', cam: Shots.combine(Shots.push(1.05, 1.25), Shots.shake(14, ev.diff[3], 2)) },
    { at: ev.slump, draw: slump, in: 'dip', cam: (s) => ({ ...focus(lerp(540, 330, ease.inOutQuad(clamp((s.t - ev.leak) / 2))), 900, 1.18) }) },
    { at: ev.drop, draw: book, in: 'cut', cam: Shots.shake(26, ev.drop, 6) },
    { at: ev.title, draw: archive, in: 'cut', cam: Shots.combine(Shots.push(1.0, 1.06), Shots.shake(14, ev.title, 5)) },
    { at: ev.items[0] - 0.01, draw: levelup, in: 'cut', cam: Shots.combine(Shots.push(1.0, 1.08), Shots.handheld(5)) },
    { at: S.S.twist[0], draw: twist, in: 'cut', cam: (s) => { const hit = s.t >= ev.twist, k = clamp((s.t - ev.twist) / 0.12); return { zoom: hit ? 1 + 0.3 * ease.outCubic(k) : 1, y: hit ? -110 * k : 0 }; } },
    { at: ev.finale, draw: finale, in: 'cut', cam: Shots.shake(24, ev.finale, 6) },
  ]);

  Studio.film({
    post: { vignette: 0.3, grain: 0.05, paper: 0.12 },
    fadeOut: 1.0,
    async init() { VO = await Studio.loadJSON('out/voice.json'); },
    draw(ctx, t) { film(ctx, t); },
  });
})();
