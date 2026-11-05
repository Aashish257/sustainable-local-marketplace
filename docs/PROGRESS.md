# Project Progress Log

Every step of the portfolio MVP work is recorded here, newest at the bottom, so no context is lost between sessions.

- **Design (source of truth):** [superpowers/specs/2026-11-05-portfolio-mvp-completion-design.md](superpowers/specs/2026-11-05-portfolio-mvp-completion-design.md)
- **Plans:** `docs/superpowers/plans/` (one per phase)
- **Code map:** `graphify-out/GRAPH_REPORT.md` (refresh with `python -m graphify update .`)

## Phase status

| # | Phase | Status | Branch |
|---|---|---|---|
| 1 | Repo cleanup + first deployment | Tasks 1–6 done and reviewed; Task 7 (deploy) needs owner | `chore/phase-1-cleanup-deploy` |
| 2 | Real data foundation | Not started | — |
| 3 | AI Sustainability Checker | Not started | — |
| 4 | UI redesign foundation | Not started | — |
| 5 | Accounts and trust | Not started | — |
| 6 | Measure and prove | Not started | — |

## Log

### 2026-11-05: Brainstorm and design
- Goal agreed: a portfolio project for web / GenAI developer jobs, with a live link; it may become a real product later.
- Gap check done: compared the problem statement and SRS with the code, and screenshotted every role (guest, buyer, seller, admin, mobile).
- Key findings: fake pillar scores in `ScoreRadar.jsx`, hardcoded claims in `ProductDetail.jsx`, fake "Verified" badges, no location, read-only profile, duplicate seller/admin menus, hidden auctions, AI-template look.
- Decided: the AI Sustainability Checker is the headline GenAI feature. It supports Gemini, Groq, Claude and OpenAI, with keys set by the operator in server env (no seller keys). It starts with Gemini. Sellers can edit the AI scores, and the product is then shown as "Seller-adjusted".
- Data sources verified: Open Food Facts (ODbL, rate-limited, so it's imported once and never called live), India Post pincode API (district/state, no coordinates), and handwritten local listings with Unsplash/Pexels photos.
- Owner rules: all work goes on new branches, and nothing merges to `main` until it's tested and error-free. Record every step here.
- Design document written and approved by the owner.
- Tooling: installed graphify 0.9.93 (pinned, code-only and offline) and built the code map (1,510 nodes, 2,842 edges). The auto-refresh git hook was blocked by permission settings, so the map is refreshed manually.
- Phase 1 plan written: `docs/superpowers/plans/2026-11-05-phase-1-cleanup-and-deploy.md` (7 tasks). Found that production blocks simulated payments, so the plan adds an opt-in `PAYMENT_SANDBOX` flag. The demo admin will be read-only.

### 2026-11-05: Phase 1 build (Tasks 1–6)
- Task 1: committed the finished `dev` work in 7 commits and pushed `dev`. Baseline: backend 95 tests, frontend 41 tests, all passing. Frontend lint shows 12 existing errors in 9 files (not enforced in CI yet).
- Task 2: branch `chore/phase-1-cleanup-deploy`. Merged `doc/` into `docs/`, moved tool notes to `docs/archive/`, removed the duplicate `backend/seed.js`, added an MIT LICENSE.
- Task 3: the demo admin is read-only (`isDemo` flag plus the `blockDemoWrites` middleware), added a "Try the demo" panel on the login page, and added `create-admin.js` for the owner's private admin.
- Task 4: added the `PAYMENT_SANDBOX=true` flag so demo payments work on the live site. The payment page says "no real money is charged".
- Task 5: added a "Waking up the server" notice, raised the API timeout from 10 s to 70 s, added the keep-alive ping workflow, and capped Vitest at 4 workers to fix flaky runner timeouts.
- Task 6 (partial): applied the safe security updates and removed the unused VPS deploy workflow. Tests are now backend 104/104, frontend 48/48, build OK. **Waiting for the owner** to decide on the breaking upgrades (zod 3→4, bcrypt 5→6).
- Task 6 done: the owner approved the zod 4 and bcrypt 6 upgrades. `npm audit` now finds no high or critical issues in either app, and CI enforces this.
- Final review by a fresh reviewer: 0 critical, 3 important (all fixed with tests), 5 minor (deferred, listed in the ledger). Fixes: the demo admin is read-only on every route; logging out of a shared demo account no longer signs out other visitors; `seed.js` now resets only demo data and runs nightly (`reset-demo.yml`). Tests: backend 109/109, frontend 48/48.
- Next: the owner opens the PR, then sets up Atlas, Render and Vercel (Task 7).
