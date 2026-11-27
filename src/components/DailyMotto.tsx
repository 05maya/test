import { mottoFor } from "@/lib/mottos";

// 교실 앞 급훈 액자. 매일 한 문장씩 바뀐다.
export default function DailyMotto() {
  const { text, label } = mottoFor();
  return (
    <figure className="motto" aria-label="오늘의 급훈">
      <figcaption className="motto-label">
        <span>오늘의 급훈</span>
        <span className="motto-date">{label}</span>
      </figcaption>
      <blockquote className="motto-text" data-motto>{text}</blockquote>
    </figure>
  );
}
