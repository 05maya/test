// 명예의 전당 명단. 구분 없이 한 줄로 두고, 화면에서 돌아가며 한 명씩 보여준다.
export type HallEntry = { kicker: string; headline: string; name: string };

export const HALL_ENTRIES: HallEntry[] = [
  { kicker: "탐구보고서 대회", headline: "금상", name: "박연우" },
  { kicker: "탐구보고서 대회", headline: "금상", name: "김은지" },
  { kicker: "2027", headline: "합격", name: "김범준" },
];

export const HALL_ROTATE_MS = 4000;
