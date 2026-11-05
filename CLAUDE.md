# SustainMarket: notes for Claude

Full-stack local sustainable marketplace (React 19 + Vite + Tailwind v4 + Zustand + React Query / Node + Express + MongoDB + Socket.io). Portfolio project aimed at web / GenAI developer jobs.

## Start every session here
1. Read `docs/PROGRESS.md` for the current phase, the branch and what was done last.
2. The design source of truth is `docs/superpowers/specs/2026-11-05-portfolio-mvp-completion-design.md`.
3. The plan for the current phase is in `docs/superpowers/plans/`.
4. For code questions, check `graphify-out/GRAPH_REPORT.md` (or use the graphify skill) before reading many files. Refresh it after code changes with `python -m graphify update .`

## Rules
- Never commit to `main` directly. Work on a feature branch, and merge only when tests pass and it's error-free.
- After every completed step, add a dated entry to `docs/PROGRESS.md`.
- Nothing fake on the site: every score, badge and stat must come from real data or be labeled demo data.
- Secrets only in `.env` files (never committed). Keep `.env.example` files updated.

## Commands
- Backend tests: `cd backend && npm test`
- Frontend tests: `cd frontend && npm test` · E2E: `cd frontend && npm run e2e`
- Dev: `npm run dev` (root)
