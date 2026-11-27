"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Step = "ask" | "notdone" | "score" | "result" | "proof" | "submitted";
const MAX_PHOTO_MB = 10;
type Props = {
  name: string;
  mode: "score" | "lesson"; // score: 과제 점수 / lesson: 오늘 수업을 들었는지
  subject: string; // "사회"
  teacher: string; // "영어 선생님"
  roomName: string; // "영어관"
  assignment: string; // "클래스카드" · "수학 과제"
  link: { href: string; label: string; external: boolean };
  great: number;
  ok: number;
};

export default function TeacherChat({ name, mode, subject, teacher, roomName, assignment, link, great, ok }: Props) {
  const [step, setStep] = useState<Step>("ask");
  const [input, setInput] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  // 인증샷(수업 들은 증거 사진): 지금은 선택·미리보기·올리기 흐름만 있고 저장은 하지 않는다.
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [photoErr, setPhotoErr] = useState("");
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setPhotoErr("");
    if (!f) { setPhotoUrl(null); setPhotoName(""); return; }
    if (!f.type.startsWith("image/")) {
      setPhotoErr("사진(이미지) 파일만 올릴 수 있어요.");
      setPhotoUrl(null); setPhotoName(""); e.target.value = "";
      return;
    }
    if (f.size > MAX_PHOTO_MB * 1024 * 1024) {
      setPhotoErr(`사진은 ${MAX_PHOTO_MB}MB 이하로 올려 주세요.`);
      setPhotoUrl(null); setPhotoName(""); e.target.value = "";
      return;
    }
    setPhotoUrl(URL.createObjectURL(f));
    setPhotoName(f.name);
  }
  const clearPhoto = () => { setPhotoUrl(null); setPhotoName(""); setPhotoErr(""); };

  const linkBtn = (label: string) =>
    link.external ? (
      <a className="btn" href={link.href} target="_blank" rel="noopener noreferrer">{label} ↗</a>
    ) : (
      <Link className="btn" href={link.href}>{label}</Link>
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
  const reset = () => { setStep("ask"); setInput(""); setScore(null); setError(""); clearPhoto(); };

  if (mode === "lesson") {
    return (
      <section className="tchat card" aria-label={`${teacher}과 대화`}>
        <div className="tchat-who">
          <span className="tchat-avatar" aria-hidden="true">👩‍🏫</span>
          <strong>{teacher}</strong>
        </div>
        <div className="tchat-bubble" aria-live="polite">
          {step === "ask" && (
            <>
              <p>{name}님, 안녕하세요! {roomName}에 잘 왔어요.</p>
              <p><b>오늘 {subject} 수업 들었어요?</b></p>
            </>
          )}
          {step === "notdone" && (
            <>
              <p>아직이에요? 그럼 <b>지금 바로 EBSi</b>에서 {subject} 수업부터 들으세요.</p>
              <p>다 듣고 나면 돌아와서 알려 주세요.</p>
            </>
          )}
          {step === "proof" && (
            <>
              <p><b>잘했어요!</b></p>
              <p>수업을 들은 <b>인증샷을 올려 주세요.</b></p>
            </>
          )}
          {step === "submitted" && <p><b>인증샷 잘 받았어요.</b> 수고했어요!</p>}
        </div>
        <div className="tchat-actions">
          {step === "ask" && (
            <>
              <button type="button" onClick={() => setStep("proof")}>들었어요</button>
              <button type="button" className="ghost" onClick={() => setStep("notdone")}>아직 안 들었어요</button>
            </>
          )}
          {step === "notdone" && (
            <>
              {linkBtn(link.label)}
              <button type="button" className="ghost" onClick={() => setStep("proof")}>다 듣고 왔어요</button>
            </>
          )}
          {step === "proof" && (
            <div className="proof">
              <label className="btn ghost proof-pick" htmlFor="tc-photo">{photoUrl ? "다른 사진 고르기" : "사진 고르기"}</label>
              <input id="tc-photo" className="sr-only" type="file" accept="image/*" onChange={pickPhoto} />
              {photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="proof-preview" src={photoUrl} alt={`선택한 인증샷 미리보기 (${photoName})`} />
              )}
              <button type="button" disabled={!photoUrl} onClick={() => setStep("submitted")}>인증샷 올리기</button>
              {photoErr && <p className="err" role="alert">{photoErr}</p>}
              <p className="muted proof-note">시범 단계예요. 올린 사진은 아직 저장되지 않아요.</p>
            </div>
          )}
          {step === "submitted" && (
            <>
              {photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="proof-preview" src={photoUrl} alt="올린 인증샷" />
              )}
              <button type="button" className="ghost" onClick={reset}>처음부터 다시</button>
              <p className="muted proof-note">시범 단계라 사진은 저장되지 않았어요.</p>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="tchat card" aria-label={`${teacher}과 대화`}>
      <div className="tchat-who">
        <span className="tchat-avatar" aria-hidden="true">👩‍🏫</span>
        <strong>{teacher}</strong>
      </div>
      <div className="tchat-bubble" aria-live="polite">
        {step === "ask" && (
          <>
            <p>{name}님, 안녕하세요! {roomName}에 잘 왔어요.</p>
            <p><b>오늘 {assignment} 점수는 몇 점이에요?</b></p>
          </>
        )}
        {step === "notdone" && (
          <>
            <p>아직 안 했다고요? 그럼 수업 전에 <b>지금 바로 {assignment}부터</b> 하세요.</p>
            <p>끝나면 돌아와서 점수를 알려 주세요.</p>
          </>
        )}
        {step === "score" && <p>좋아요. 오늘 {assignment} 점수를 숫자로 알려 주세요. (0~100)</p>}
        {step === "result" && score !== null && (
          score >= great ? (
            <p><b>{score}점!</b> 아주 잘했어요. 이 기세로 오늘 수업도 집중하세요.</p>
          ) : score >= ok ? (
            <p><b>{score}점</b>이군요. 나쁘지 않아요. 틀린 부분만 <b>한 번 더 복습</b>하고 오세요.</p>
          ) : (
            <p><b>{score}점</b>이에요. 오늘은 부족해요. <b>{assignment} 다시 하세요.</b> 끝나면 다시 점수를 알려 주세요.</p>
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
            {linkBtn(link.label)}
            <button type="button" className="ghost" onClick={() => setStep("score")}>다 하고 왔어요</button>
          </>
        )}
        {step === "score" && (
          <form onSubmit={submit} className="tchat-form">
            <label htmlFor="tc-score" className="sr-only">{assignment} 점수</label>
            <input id="tc-score" inputMode="numeric" autoComplete="off" placeholder="예: 85" value={input} onChange={(e) => setInput(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "tc-err" : undefined} />
            <button type="submit">알려주기</button>
            <button type="button" className="ghost" onClick={() => setStep("notdone")}>아직 안 했어요</button>
            {error && <p id="tc-err" className="err" role="alert">{error}</p>}
          </form>
        )}
        {step === "result" && score !== null && (
          <>
            {score < great && linkBtn(link.external ? `${assignment} ${score < ok ? "다시 하기" : "복습하기"}` : link.label)}
            <button type="button" className="ghost" onClick={reset}>처음부터 다시</button>
          </>
        )}
      </div>
    </section>
  );
}
