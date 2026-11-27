"use client";

import { useState } from "react";

type Step = "ask" | "notdone" | "score" | "result";

export default function EnglishTeacher({ name, classCardUrl, great, ok }: { name: string; classCardUrl: string; great: number; ok: number }) {
  const [step, setStep] = useState<Step>("ask");
  const [input, setInput] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");

  const link = (label: string) => (
    <a className="btn" href={classCardUrl} target="_blank" rel="noopener noreferrer">{label} ↗</a>
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(input.trim());
    if (input.trim() === "" || !Number.isInteger(n) || n < 0 || n > 100) {
      setError("0~100 사이 숫자로 알려 주세요.");
      return;
    }
    setError("");
    setScore(n);
    setStep("result");
  }

  function reset() {
    setStep("ask"); setInput(""); setScore(null); setError("");
  }

  return (
    <section className="tchat card" aria-label="영어 선생님과 대화">
      <div className="tchat-who">
        <span className="tchat-avatar" aria-hidden="true">👩‍🏫</span>
        <strong>영어 선생님</strong>
      </div>
      <div className="tchat-bubble" aria-live="polite">
        {step === "ask" && (
          <>
            <p>{name}님, 안녕하세요! 영어관에 잘 왔어요.</p>
            <p><b>오늘 클래스카드 점수는 몇 점이에요?</b></p>
          </>
        )}
        {step === "notdone" && (
          <>
            <p>아직 안 했다고요? 그럼 수업 전에 <b>지금 바로 클래스카드부터</b> 하세요.</p>
            <p>끝나면 돌아와서 점수를 알려 주세요.</p>
          </>
        )}
        {step === "score" && <p>좋아요. 오늘 클래스카드 점수를 숫자로 알려 주세요. (0~100)</p>}
        {step === "result" && score !== null && (
          score >= great ? (
            <p><b>{score}점!</b> 아주 잘했어요. 이 기세로 오늘 수업도 집중하세요.</p>
          ) : score >= ok ? (
            <p><b>{score}점</b>이군요. 나쁘지 않아요. 틀린 단어만 <b>한 번 더 복습</b>하고 오세요.</p>
          ) : (
            <p><b>{score}점</b>이에요. 오늘은 부족해요. <b>클래스카드를 다시 하세요.</b> 끝나면 다시 점수를 알려 주세요.</p>
          )
        )}
      </div>

      <div className="tchat-actions">
        {step === "ask" && (
          <>
            <button type="button" onClick={() => setStep("score")}>점수 알려줄게요</button>
            <button type="button" className="ghost" onClick={() => setStep("notdone")}>아직 안 했어요</button>
          </>
        )}
        {step === "notdone" && (
          <>
            {link("클래스카드 하러 가기")}
            <button type="button" className="ghost" onClick={() => setStep("score")}>다 하고 왔어요</button>
          </>
        )}
        {step === "score" && (
          <form onSubmit={submit} className="tchat-form">
            <label htmlFor="cc-score" className="sr-only">클래스카드 점수</label>
            <input id="cc-score" inputMode="numeric" autoComplete="off" placeholder="예: 85" value={input} onChange={(e) => setInput(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "cc-err" : undefined} />
            <button type="submit">알려주기</button>
            <button type="button" className="ghost" onClick={() => setStep("notdone")}>아직 안 했어요</button>
            {error && <p id="cc-err" className="err" role="alert">{error}</p>}
          </form>
        )}
        {step === "result" && score !== null && (
          <>
            {score < great && link(score < ok ? "클래스카드 다시 하기" : "클래스카드로 복습하기")}
            <button type="button" className="ghost" onClick={reset}>처음부터 다시</button>
          </>
        )}
      </div>
    </section>
  );
}
