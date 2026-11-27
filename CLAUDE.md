# CLAUDE.md

EST Virtual Academy — 개인화 학습공간 기반 온라인 학원 플랫폼 (MVP). 요구사항은 PRD(README 참고) 기준.

## Commands
- `npm install` — 설치 (`.env.example`을 `.env`로 복사)
- `npx prisma db push && npm run db:seed` — SQLite DB 생성 및 데모 데이터
- `npm run dev` — 개발 서버 / `npm run build` — 프로덕션 빌드 / `npm run typecheck`
- 주의: `npm run db:reset`은 `--force-reset`을 쓰므로 Prisma가 AI 에이전트 실행을 차단함. 사용자가 직접 실행할 것.

## Architecture
- Next.js 15 App Router + TypeScript, Prisma 6 + SQLite. 서버 액션 중심, 클라이언트 JS 최소.
- `src/lib/auth.ts` — HMAC 서명 쿠키 세션, `requireUser`/`requireAdmin`
- `src/lib/access.ts` — 자료 가시성(공통/그룹/개인)과 학부모→자녀 권한 로직. 권한 판단은 여기에 모은다.
- `src/lib/rooms.ts` — 교실 정의(지도 좌표, 접근 역할). 새 교실은 여기에 추가.
- `src/app/page.tsx` 로비(SVG 지도), `src/app/rooms/[slug]` 교실, `src/app/admin/*` 관리자.
- 모든 admin 서버 액션은 첫 줄에서 `requireAdmin()` 호출. 외부 링크는 http/https만 허용.
- 인생게임 플래너 주소는 환경변수 `LIFEGAME_PLANNER_URL`.
