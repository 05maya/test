// EST 숏폼 드라마 EP.01 《수행평가 지옥 탈출》 (9:16, ~52s). Black + gold.
// One student, one bookshelf. The first half is the hell of preparing a school assignment (a flood of
// notifications, the obvious topic, no way to design the experiment, no sources, no time), then the EST
// secret archive solves it all, then the twist: one more assignment.
// This file is the single source of truth: song.js plays it, film.js draws it. The dialogue is spoken
// (offline text-to-speech, Korean) and the mouth moves with the voice. There are no subtitles.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16'; // staged for Reels
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const STYLE = 'flat'; // clean fills, no wobble: closest to a cel look; neon is switched on for the archive
  const clock = makeClock({ bpm: 120, offset: 0.5 });
  const { T, BEAT } = clock;
  const DURATION = T(23) + 5.6;

  // every named moment, in bars
  const ev = {
    notif: [T(0, 0), T(0, 1.5), T(0, 3)], // three assignment notifications
    search: T(3), // the obvious topic: crumpled papers on 8ths
    papers: [T(3, 2), T(3, 2.5), T(3, 3), T(3, 3.5), T(4, 0), T(4, 0.5), T(4, 1), T(4, 1.5)],
    diff: [T(6), T(7), T(8), T(9)], // topic / experiment / sources / time: one bar each
    slump: T(10), // collapse; a gold line leaks from the shelf
    leak: T(10, 1),
    drop: T(11), // the EST book is pulled: the archive opens
    title: T(11, 2), // EST SECRET ARCHIVE stamped on 8ths
    items: [T(14), T(15, 2), T(17, 1)], // three archive finds
    check: [T(18, 2), T(18, 3), T(19, 0)], // three ticks
    twist: T(20, 2), // one more assignment: the math notification
    open: T(22, 2), // he goes back to the shelf
    finale: T(23), // the archive bursts open again: logo
    tag: T(23, 2),
  };
  const S = {
    hell: [0, T(10)], slump: [T(10), T(11)], archive: [T(11), T(14)], levelup: [T(14), T(19, 2)],
    twist: [T(19, 2), T(22, 2)], finale: [T(22, 2), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' }, F: { notes: ['A3', 'C4', 'F4'], bass: 'F1' },
    C: { notes: ['G3', 'C4', 'E4'], bass: 'C2' }, G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' },
    Dm: { notes: ['A3', 'D4', 'F4'], bass: 'D2' }, E: { notes: ['G#3', 'B3', 'E4'], bass: 'E2' },
  }, (() => {
    const rows = [];
    const prog = ['Am', 'F', 'C', 'G'];
    for (let b = 0; b < 24; b++) rows.push([b, 0, 4, b < 11 ? (b % 2 ? 'Dm' : 'Am') : b >= 19 && b < 23 ? (b % 2 ? 'E' : 'Am') : prog[b % 4]]);
    return rows;
  })());

  // the voice (offline text-to-speech). `who` picks the mouth; kid = the student, host = the archive.
  const vo = [
    { at: T(1, 1), text: '아니, 나보고 이걸 다 하라고?', who: 'kid', voice: 'ko+f3', rate: 185 },
    { at: T(3, 0.5), text: '탐구 주제 추천…… 이건 너무 뻔하잖아!', who: 'kid', voice: 'ko+f3', rate: 185 },
    { at: T(6, 0.25), text: '주제를 못 정하겠어……', who: 'kid', voice: 'ko+f3', rate: 190 },
    { at: T(7, 0.25), text: '실험 설계는 어떻게 하지?', who: 'kid', voice: 'ko+f3', rate: 200 },
    { at: T(8, 0.25), text: '자료는 어디서 찾아……', who: 'kid', voice: 'ko+f3', rate: 190 },
    { at: T(9, 0.25), text: '시간이 없다고오!!', who: 'kid', voice: 'ko+f3', rate: 200 },
    { at: T(11, 3), text: '뭐야…… 여기가 어디야?', who: 'kid', voice: 'ko+f3', rate: 185 },
    { at: T(13, 0.3), text: '잠깐! 이걸 다 쓸 수 있다고?', who: 'kid', voice: 'ko+f3', rate: 190 },
    { at: T(14, 1), text: '오! 이 개념으로 실험을 설계하고!', who: 'kid', voice: 'ko+f3', rate: 195 },
    { at: T(15, 2.4), text: '이걸 연결하면 탐구가 확장되잖아!', who: 'kid', voice: 'ko+f3', rate: 195 },
    { at: T(17, 1.4), text: '영어 발표까지 해결!', who: 'kid', voice: 'ko+f3', rate: 190 },
    { at: T(18, 2.4), text: '됐다! 이제 뭘 해야 할지 알겠어!', who: 'kid', voice: 'ko+f3', rate: 190 },
    { at: T(21, 1), text: 'EST야…… 문 열어.', who: 'kid', voice: 'ko+f3', rate: 170 },
    { at: T(23, 2.5), text: 'EST. 수행평가의 히든카드.', who: 'host', voice: 'ko+m6', rate: 130 },
  ];

  const markers = {
    notif: { t: ev.notif[0], sync: 'a' },
    drop: { t: ev.drop, sync: 'av' }, // the book is pulled: boom + impact frame
    twist: { t: ev.twist, sync: 'av' }, // the math notification: record scratch + snap zoom
    finale: { t: ev.finale, sync: 'av' }, // the archive bursts open again
    title: ev.title,
    tag: ev.tag,
  };

  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
