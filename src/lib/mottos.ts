// 오늘의 급훈. 날짜(한국 시간) 기준으로 하루에 하나씩 순서대로 돌아가며 바뀐다.
export const MOTTOS = [
  "오늘 걷지 않으면 내일은 뛰어야 한다.",
  "성적은 배신하지 않는다, 다만 늦게 올 뿐이다.",
  "지금 잠을 자면 꿈을 꾸지만, 지금 공부하면 꿈을 이룬다.",
  "실력은 평소에 쌓고, 점수는 시험 날 가져온다.",
  "1등급은 우연히 만들어지지 않는다.",
  "모르는 건 죄가 아니지만, 안 묻는 건 손해다.",
  "오늘의 오답 노트가 내일의 정답이 된다.",
  "단어 하나가 등급을 바꾼다.",
  "감으로 풀지 말고 근거로 풀어라.",
  "엉덩이 힘이 곧 실력이다.",
  "공부는 배신해도 선생님은 배신 안 한다.",
  "숙제는 밀리는 게 아니라 쌓이는 것이다.",
  "성적 오르면 소고기, 떨어지면 콩나물.",
  "스마트폰은 잠시 끄고, 뇌를 켜자.",
  "질문은 환영, 핑계는 사절.",
  "결국 해내는 사람",
  "핑계 대신 결과로",
  "기본에 충실하자",
];

const DAY_MS = 86_400_000;
const KST_OFFSET_MS = 9 * 3_600_000;

/** 한국 시간 기준 오늘의 급훈과 날짜 표시. */
export function mottoFor(now: Date = new Date()) {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const day = Math.floor(kst.getTime() / DAY_MS);
  const label = `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 ${"일월화수목금토"[kst.getUTCDay()]}요일`;
  return { text: MOTTOS[day % MOTTOS.length], label };
}

/** 한국 시간 기준 오늘이 에포크 이후 며칠째인지. 하루에 하나씩 순환하는 콘텐츠의 시작 위치 계산에 쓴다. */
export function kstDayNumber(now: Date = new Date()) {
  return Math.floor((now.getTime() + KST_OFFSET_MS) / DAY_MS);
}
