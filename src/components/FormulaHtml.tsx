import { parseFormula } from "@/lib/math";

/** 공식 전체 목록용 HTML 수식 (위·아래첨자). */
export function FormulaHtml({ src }: { src: string }) {
  return (
    <span className="formula-html">
      {parseFormula(src).map((s, i) => (s.k === "sup" ? <sup key={i}>{s.t}</sup> : s.k === "sub" ? <sub key={i}>{s.t}</sub> : <span key={i}>{s.t}</span>))}
    </span>
  );
}
