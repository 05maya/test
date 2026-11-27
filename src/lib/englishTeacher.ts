// 영어관 선생님 설정. 클래스카드 주소와 점수 기준은 여기서 바꾼다.
export const CLASSCARD_URL = process.env.CLASSCARD_URL || "https://www.classcard.net/";

/** 클래스카드 점수(0~100) 기준. 이 점수 이상이면 해당 등급 응원, 미만이면 다시 하도록 지시한다. */
export const SCORE_GREAT = 90;
export const SCORE_OK = 70;
