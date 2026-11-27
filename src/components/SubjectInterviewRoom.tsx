"use client";

import Link from "next/link";
import { useState } from "react";
import { CX, Person } from "./InterviewPeople";
import { wrapLines } from "./boardKit";
import { DEPARTMENTS, OTHER_SCHOOL, UNIVERSITIES } from "@/lib/interview";

type Step = "school" | "dept" | "done";

function Bubble({ cx, text }: { cx: number; text: string }) {
  const lines = wrapLines(text, 24).slice(0, 3);
  const h = lines.length * 22 + 20;
  const w = 270;
  const x = Math.max(12, Math.min(960 - w - 12, cx - w / 2));
  const bottom = 178;
  return (
    <g aria-hidden="true" key={text} data-iv-bubble>
      <rect x={x} y={bottom - h} width={w} height={h} rx={14} fill="#fffdf6" stroke="#d8b25a" strokeWidth="2" />
      <polygon points={`${cx - 10},${bottom - 1} ${cx + 10},${bottom - 1} ${cx},${bottom + 14}`} fill="#fffdf6" stroke="#d8b25a" strokeWidth="2" strokeLinejoin="round" />
      <rect x={cx - 11} y={bottom - 3} width={22} height={4} fill="#fffdf6" />
      {lines.map((l, i) => (
        <text key={i} x={x + w / 2} y={bottom - h + 28 + i * 22} textAnchor="middle" fontSize="16" fontWeight="600" fill="#2b2b33">{l}</text>
      ))}
    </g>
  );
}

function Scene({ speaker, text }: { speaker: number; text: string }) {
  return (
    <svg className="scene" viewBox="0 0 960 540" role="img" aria-label="교과면접실: 면접위원 세 명이 앉아 지원 학교와 학과를 묻습니다.">
      <defs>
        <linearGradient id="s-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b7fa6" /><stop offset="1" stopColor="#55678d" /></linearGradient>
        <linearGradient id="s-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a6a8c" /><stop offset="1" stopColor="#47557a" /></linearGradient>
        <linearGradient id="s-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9a574" /><stop offset="1" stopColor="#b48c5c" /></linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#s-wall)" />
      <rect y="320" width="960" height="84" fill="#8a6a43" opacity=".35" />
      <rect y="400" width="960" height="140" fill="url(#s-floor)" />
      <rect y="396" width="960" height="8" fill="#3b4660" />
      <rect x="56" y="80" width="70" height="90" rx="3" fill="#f7f1e6" stroke="#b88a5b" strokeWidth="4" />
      <rect x="66" y="90" width="50" height="70" fill="#cfe0f2" /><path d="M66 160l16-24 12 14 10-12 12 22z" fill="#8bb08f" />
      <rect x="776" y="70" width="130" height="190" rx="4" fill="#f9f4ea" />
      <rect x="784" y="78" width="114" height="174" fill="#a9c9e8" />
      {Array.from({ length: 11 }, (_, i) => <rect key={i} x="784" y={78 + i * 14} width="114" height="9" fill="#e9e2d2" />)}
      <rect x="380" y="26" width="200" height="34" rx="10" fill="#2f4b8f" />
      <text x="480" y="49" textAnchor="middle" fontSize="17" fontWeight="800" fill="#fff" letterSpacing="2">교과면접</text>

      <Person cx={CX[0]} skin="#f0c7a4" hair="#3b2b2b" blazer="#2f4b8f" kind="bob" />
      <Person cx={CX[1]} skin="#e3b48f" hair="#2b2b33" blazer="#3d4150" kind="short" />
      <Person cx={CX[2]} skin="#c99a77" hair="#4a2f25" blazer="#8c4a5c" kind="long" />
      <polygon points="190,326 770,326 810,378 150,378" fill="#d5b182" />
      <polygon points="190,326 770,326 774,332 186,332" fill="#e4c9a0" />
      <rect x="150" y="378" width="660" height="74" fill="url(#s-desk)" />
      <rect x="150" y="378" width="660" height="5" fill="#00000026" />
      {CX.map((cx, i) => (
        <g key={cx} data-iv-plate={i}>
          <rect x={cx - 52} y={398} width={104} height={24} rx={7} fill={i === speaker ? "#d8b25a" : "#9a9078"} />
          <text x={cx} y={415} textAnchor="middle" fontSize="13" fontWeight="800" fill={i === speaker ? "#3b2a0e" : "#fff"}>면접위원 {i + 1}</text>
        </g>
      ))}
      <Bubble cx={CX[speaker]} text={text} />
      <rect x="420" y="484" width="120" height="80" rx="22" fill="#44547a" />
      <rect x="432" y="494" width="96" height="14" rx="7" fill="#ffffff22" />
    </svg>
  );
}

export default function SubjectInterviewRoom() {
  const [step, setStep] = useState<Step>("school");
  const [pick, setPick] = useState<string>("");
  const [custom, setCustom] = useState("");
  const [school, setSchool] = useState("");
  const [dept, setDept] = useState("");
  const [deptInput, setDeptInput] = useState("");
  const [error, setError] = useState("");

  const chosen = pick === OTHER_SCHOOL ? custom.trim() : pick;
  const speaker = step === "school" ? 0 : step === "dept" ? 1 : 2;
  const question =
    step === "school"
      ? "안녕하세요. 어느 학교에 지원했나요?"
      : step === "dept"
        ? `${school}에 지원했군요. 어느 학과에 지원했나요?`
        : `${school} ${dept} 지원이군요. 잘 알겠습니다.`;

  function nextFromSchool() {
    if (!chosen) { setError(pick === OTHER_SCHOOL ? "학교 이름을 입력해 주세요." : "지원한 학교를 선택해 주세요."); return; }
    setError("");
    setSchool(chosen);
    setStep("dept");
  }
  function nextFromDept(e: React.FormEvent) {
    e.preventDefault();
    const d = deptInput.trim();
    if (!d) { setError("지원한 학과를 입력해 주세요."); return; }
    setError("");
    setDept(d);
    setStep("done");
  }
  function restart() {
    setStep("school"); setPick(""); setCustom(""); setSchool(""); setDept(""); setDeptInput(""); setError("");
  }

  return (
    <>
      <Scene speaker={speaker} text={question} />
      <section className="card iv-panel" aria-label="면접 질문">
        <p className="iv-q" aria-live="polite">
          <strong>면접위원 {speaker + 1}</strong> {question}
        </p>

        {step === "school" && (
          <>
            <div className="chips" role="radiogroup" aria-label="지원 대학교">
              {[...UNIVERSITIES, OTHER_SCHOOL].map((u) => (
                <button key={u} type="button" role="radio" aria-checked={pick === u} className="chip" onClick={() => { setPick(u); setError(""); }}>{u}</button>
              ))}
            </div>
            {pick === OTHER_SCHOOL && (
              <p>
                <label htmlFor="iv-custom" className="sr-only">학교 이름</label>
                <input id="iv-custom" value={custom} maxLength={40} placeholder="학교 이름을 입력하세요" onChange={(e) => setCustom(e.target.value)} />
              </p>
            )}
            {error && <p className="err" role="alert">{error}</p>}
            <p><button type="button" onClick={nextFromSchool}>다음</button></p>
          </>
        )}

        {step === "dept" && (
          <form onSubmit={nextFromDept}>
            <p className="muted">지원 학교: <strong>{school}</strong></p>
            <label htmlFor="iv-dept" className="sr-only">지원 학과</label>
            <input id="iv-dept" list="iv-depts" value={deptInput} maxLength={40} autoComplete="off" placeholder="예: 경영학과" onChange={(e) => setDeptInput(e.target.value)} aria-invalid={!!error} />
            <datalist id="iv-depts">{DEPARTMENTS.map((d) => <option key={d} value={d} />)}</datalist>
            {error && <p className="err" role="alert">{error}</p>}
            <p className="tchat-actions">
              <button type="submit">답하기</button>
              <button type="button" className="ghost" onClick={() => { setStep("school"); setError(""); }}>학교 다시 선택</button>
            </p>
          </form>
        )}

        {step === "done" && (
          <>
            <dl className="iv-summary">
              <dt>지원 학교</dt><dd>{school}</dd>
              <dt>지원 학과</dt><dd>{dept}</dd>
            </dl>
            <p className="muted">면접 문항은 아직 준비 중이에요. 지원 정보는 저장되지 않아요.</p>
            <p className="tchat-actions">
              <button type="button" className="ghost" onClick={restart}>처음부터 다시</button>
              <Link className="btn ghost" href="/rooms/interview">← 면접실로</Link>
            </p>
          </>
        )}
      </section>
    </>
  );
}
