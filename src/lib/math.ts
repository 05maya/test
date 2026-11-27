// 수학관 칠판에 돌아가며 나오는 중·고등 수학 공식.
// 표기: ^ 위첨자, _ 아래첨자 (한 글자 또는 {여러 글자}).
export type MathFormula = { tag: string; f: string };

export const MATH_FORMULAS: MathFormula[] = [
  { tag: "중1 · 원", f: "S = πr^2 ,  l = 2πr" },
  { tag: "중1 · 구의 부피", f: "V = (4/3)πr^3" },
  { tag: "중2 · 곱셈 공식", f: "(a + b)^2 = a^2 + 2ab + b^2" },
  { tag: "중2 · 곱셈 공식", f: "(a + b)(a − b) = a^2 − b^2" },
  { tag: "중2 · 일차함수", f: "y = ax + b" },
  { tag: "중2 · 확률", f: "P(A) = n(A) / n(S)" },
  { tag: "중3 · 피타고라스 정리", f: "a^2 + b^2 = c^2" },
  { tag: "중3 · 이차방정식의 근의 공식", f: "x = (−b ± √(b^2 − 4ac)) / 2a" },
  { tag: "중3 · 삼각비", f: "sin^2 A + cos^2 A = 1" },
  { tag: "고1 · 판별식", f: "D = b^2 − 4ac" },
  { tag: "고1 · 근과 계수의 관계", f: "α + β = −b/a ,  αβ = c/a" },
  { tag: "고1 · 두 점 사이의 거리", f: "AB = √((x_2 − x_1)^2 + (y_2 − y_1)^2)" },
  { tag: "고1 · 원의 방정식", f: "(x − a)^2 + (y − b)^2 = r^2" },
  { tag: "고1 · 점과 직선 사이의 거리", f: "d = |ax_0 + by_0 + c| / √(a^2 + b^2)" },
  { tag: "고1 · 조합", f: "nCr = n! / (r!(n − r)!)" },
  { tag: "수학Ⅰ · 지수법칙", f: "a^m × a^n = a^{m+n}" },
  { tag: "수학Ⅰ · 로그", f: "log_a MN = log_a M + log_a N" },
  { tag: "수학Ⅰ · 삼각함수의 관계", f: "tan θ = sin θ / cos θ" },
  { tag: "수학Ⅰ · 사인법칙", f: "a / sin A = b / sin B = c / sin C = 2R" },
  { tag: "수학Ⅰ · 코사인법칙", f: "c^2 = a^2 + b^2 − 2ab cos C" },
  { tag: "수학Ⅰ · 등차수열", f: "a_n = a_1 + (n − 1)d" },
  { tag: "수학Ⅰ · 등차수열의 합", f: "S_n = n(a_1 + a_n) / 2" },
  { tag: "수학Ⅰ · 등비수열", f: "a_n = a_1 r^{n−1}" },
  { tag: "수학Ⅱ · 다항함수의 미분", f: "(x^n)' = nx^{n−1}" },
  { tag: "수학Ⅱ · 다항함수의 적분", f: "∫ x^n dx = x^{n+1} / (n+1) + C" },
  { tag: "확률과 통계 · 조건부확률", f: "P(B|A) = P(A∩B) / P(A)" },
  { tag: "미적분 · 지수함수의 미분", f: "(e^x)' = e^x" },
];

export const MATH_ROTATE_MS = 7000;

export type Seg = { t: string; k: "n" | "sup" | "sub" };

export function parseFormula(src: string): Seg[] {
  const out: Seg[] = [];
  let buf = "";
  let i = 0;
  const flush = () => { if (buf) { out.push({ t: buf, k: "n" }); buf = ""; } };
  while (i < src.length) {
    const c = src[i];
    if (c === "^" || c === "_") {
      flush();
      i++;
      let t: string;
      if (src[i] === "{") {
        const j = src.indexOf("}", i);
        t = src.slice(i + 1, j);
        i = j + 1;
      } else {
        t = src[i] ?? "";
        i++;
      }
      out.push({ t, k: c === "^" ? "sup" : "sub" });
    } else {
      buf += c;
      i++;
    }
  }
  flush();
  return out;
}

/** 칠판 글자 크기를 정하기 위한 대략적인 폭(글자 수). */
export function formulaWidth(src: string) {
  return parseFormula(src).reduce((n, s) => n + s.t.length * (s.k === "n" ? 1 : 0.6), 0);
}
