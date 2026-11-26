# EST Virtual Academy (MVP)

2D 가상 학원 + 기존 EST 프로그램 연결 + 학생별 자료 배정 플랫폼.

## 실행
```bash
cp .env.example .env      # SESSION_SECRET 변경, LIFEGAME_PLANNER_URL 설정
npm install
npx prisma db push
npm run db:seed
npm run dev
```

## 데모 계정 (시드 데이터, 운영 전 반드시 삭제/변경)
| 역할 | 아이디 | 비밀번호 |
|---|---|---|
| 관리자 | admin | admin1234 |
| 학생 | student1 / student2 | student1234 |
| 학부모 | parent1 (student1의 부모) | parent1234 |
| 교사 | teacher1 | teacher1234 |

## MVP 범위 대응
F-01/02 로비 지도·교실 이동 · F-03 로그인/권한 · F-04 외부 링크 연결 · F-05 공통/그룹/개인 자료 · F-06 자습실(플래너) · F-07 탐구보고서 앱 링크(과학관·사회관) · F-08 학부모대기실 · F-09 관리자(계정, 자료 일괄 배정, 공지) · F-10 상담 신청/일정 관리.
향후(F-11, F-12)는 미구현.
