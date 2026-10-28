// THE SONG: every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems, LUFS=-14 sets loudness)
// Hell (bars 0-10): a low drone, a ticking clock that speeds up, notification chimes, paper tosses on 8ths.
// Then a held breath, and the EST archive opens on an orchestral drop (bar 11). The level-up is an EDM groove.
// The twist is a record scratch into near-silence and a heartbeat; the finale is the second burst + a held chord.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const Voice = require('./engine/audio/voice');
const U = require('./engine/util');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock, chordAt } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), strings = bus(), fx = bus(), verb = bus();
const rng = U.mulberry32(11);
const buses = { drums, bass, pad, keys };

// ---------- hell: a low drone, a clock that ticks faster, a bass pulse that tightens ----------
for (let b = 0; b < 10; b += 2) {
  const { L, R } = I.padNote(m(b % 4 ? 'F2' : 'A2'), BEAT * 8, { cutoff: 500, attack: 1.2, release: 1.2, detune: 0.1 });
  pad.addStereo(L, R, T(b), 0.5);
}
for (let b = 0; b < 10; b++) {
  const steps = b < 8 ? 4 : 8; // the clock doubles in the last two bars
  for (let k = 0; k < steps; k++) fx.addMono(I.woodTick(k % 2 ? 1.2 : 1), T(b, k * (4 / steps)), 0.07 + b * 0.008, k % 2 ? 0.3 : -0.3);
}
for (let b = 3; b < 10; b++) {
  const root = sc.chords.find((c) => c.bar === b);
  const n = root ? root.bass : m('A1');
  for (const beat of [0, 1.5, 2]) bass.addMono(I.bass(n, BEAT * 0.8, { bright: 0.15, sub: 1 }), T(b, beat), 0.32);
}
// notifications: three chimes, each higher
ev.notif.forEach((t, i) => fx.addMono(I.ting(m(['E6', 'G6', 'B6'][i]), {}), t, 0.4, (i - 1) * 0.35));
// the crumpled papers: a paper "fwip" on every 8th
ev.papers.forEach((t, i) => { fx.addMono(I.paperFwip(0.9 + (i % 3) * 0.1), t, 0.3, (i % 2 ? 0.4 : -0.4)); keys.addMono(I.pluck(m('A3') + (i % 4) * 3, { decay: 6, cutoff: 1800 }), t, 0.06); });
// the four difficulties: a stamp and a rising note on each bar
ev.diff.forEach((t, i) => {
  fx.addMono(I.thud(80 - i * 6, 14), t, 0.5);
  keys.addMono(I.pluck(m(['A3', 'C4', 'E4', 'G4'][i]), { decay: 5, cutoff: 2600 }), t, 0.22);
  keys.addMono(I.pluck(m(['E4', 'G4', 'B4', 'D5'][i]), { decay: 5, cutoff: 2600 }), t + BEAT, 0.12);
});
// the collapse and a heartbeat under the leak
for (let k = 0; k < 4; k++) fx.addMono(I.heartbeat(), ev.slump + k * BEAT * 2 * 0.5 + 0.1, 0.3 + k * 0.08);
fx.addMono(I.noiseSweep(ev.drop - 0.25 - ev.leak, 200, 7000, { q: 1.2, pink: true, shape: (x) => x * x }), ev.leak, 0.16);

// ---------- the drop: the archive opens ----------
fx.addMono(I.subBoom(1.6, 90, 32), ev.drop, 0.7);
fx.addMono(I.paperFwip(0.7), ev.drop - 0.12, 0.3);
drums.addMono(I.crash(3), ev.drop, 0.5);
Genre.play('orchestral', { clock, from: 11, to: 14, chordAt, buses, gain: 1.0 });
// EST stamped on 8ths: brass stabs climbing
['A3', 'C4', 'E4'].forEach((n, i) => { const { L, R } = I.brassNote(m(n) + 12, BEAT * 0.5, { stab: true, bright: 1.2, seed: i }); strings.addStereo(L, R, ev.title + i * BEAT / 2, 0.16); });

// ---------- level-up: an EDM groove; every archive find is a rising chime, every tick a pop ----------
Genre.play('edm', { clock, from: 14, to: 20, chordAt, buses, gain: 0.8 });
ev.items.forEach((t, i) => {
  fx.addMono(I.ting(m(['G5', 'B5', 'D6'][i]), {}), t, 0.34, (i - 1) * 0.4);
  verb.addMono(I.ting(m(['G5', 'B5', 'D6'][i]), {}), t, 0.12);
  fx.addMono(I.whistle(0.25), t - 0.12, 0.06);
  keys.addMono(I.bell(m(['G5', 'B5', 'D6'][i]), 1.4, 3, 2.1), t, 0.12);
});
ev.check.forEach((t, i) => fx.addMono(I.pop(1 + i * 0.25), t, 0.45, (i - 1) * 0.3));

// ---------- the twist: a scratch, then nearly silence ----------
for (const b of [pad, bass, keys, strings, drums]) MIX.gate(b, ev.twist - 0.25, ev.open - 0.05, 0.01); // an 8th of held breath, then the scratch
MIX.gate(fx, ev.twist - 0.25, ev.twist - 0.005, 0.004); MIX.gate(verb, ev.twist - 0.25, ev.twist + 0.4, 0.004); // dead silence for an 8th, so the scratch is the only hit
fx.addMono(I.scratch(0.34), ev.twist, 0.5);
fx.addMono(I.bwomp(), ev.twist + BEAT * 2, 0.3);
for (let k = 0; k < 4; k++) fx.addMono(I.heartbeat(), ev.twist + 0.6 + k * BEAT * 2, 0.34 + k * 0.05);
// he goes back to the shelf: a riser up to the second burst
fx.addMono(I.noiseSweep(ev.finale - ev.open, 250, 8000, { q: 1.2, pink: true, shape: (x) => x * x }), ev.open, 0.2);
for (let k = 0; k < 8; k++) fx.addMono(I.woodTick(1 + k * 0.05), ev.open + k * BEAT * 0.5 * 0.75, 0.1 + k * 0.01);

// ---------- the finale: the burst, the logo, a held chord ----------
fx.addMono(I.subBoom(2.0, 90, 30), ev.finale, 0.75);
drums.addMono(I.crash(5), ev.finale, 0.55);
drums.addMono(I.timpani(m('A2'), { decay: 1.2 }), ev.finale, 0.6);
for (const n of ['A3', 'E4', 'A4', 'C#5']) {
  const { L, R } = I.strings(m(n), 4.6, { attack: 0.25, release: 1.8, bright: 1, seed: m(n) });
  strings.addStereo(L, R, ev.finale + 0.05, 0.14);
  const p = I.padNote(m(n) - 12, 4.6, { cutoff: 900, attack: 0.3, release: 1.8 });
  pad.addStereo(p.L, p.R, ev.finale + 0.05, 0.2);
}
['E5', 'A5', 'C#6', 'E6'].forEach((n, i) => keys.addMono(I.musicBox(m(n), { decay: 3 }), ev.finale + BEAT * 2 + i * BEAT * 0.75, 0.12));
for (const t of [T(23, 0.5), T(23, 1)]) fx.addMono(I.ting(m('A6'), {}), t, 0.15);

// ---------- the voiceover ----------
const vo = Voice.speak(sc.vo, { out: path.join(__dirname, 'out'), length: DURATION });
for (const l of vo.lines) console.log(`voice ${l.t.toFixed(2)}-${l.end.toFixed(2)} ${l.who}: ${l.text}`);

// ---------- mix ----------
for (const b of [drums, bass, pad, keys, strings]) MIX.gate(b, ev.drop - 0.25, ev.drop, 0.005); // the held breath before the drop
const room = reverb(verb, { room: 0.7, damp: 0.4 });
const music = [drums, bass, pad, keys, strings];
MIX.duck(music, vo.bus, { depth: 0.55 });
const stems = { drums, bass, pad, keys, strings, fx, voice: vo.bus, verb: room };
const GAIN = { drums: 1, bass: 1.3, pad: 2.2, keys: 2.0, strings: 2.2, fx: 0.45, voice: 2.4, verb: 0.5 }; // set with engine/tools/levels.js: the voice sits on top
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS  voice: ${vo.engine} (${vo.lines.length} lines)`);
