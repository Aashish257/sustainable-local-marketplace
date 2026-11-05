# Project Progress Log

Every step of the portfolio MVP work is recorded here, newest at the bottom, so no context is lost between sessions.

- **Design (source of truth):** [superpowers/specs/2026-11-05-portfolio-mvp-completion-design.md](superpowers/specs/2026-11-05-portfolio-mvp-completion-design.md)
- **Plans:** `docs/superpowers/plans/` (one per phase)
- **Code map:** `graphify-out/GRAPH_REPORT.md` (refresh with `python -m graphify update .`)

## Phase status

| # | Phase | Status | Branch |
|---|---|---|---|
| 1 | Repo cleanup + first deployment | Plan written, waiting for review | `chore/phase-1-cleanup-deploy` (not created yet) |
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
