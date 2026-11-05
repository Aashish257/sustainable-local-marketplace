# SustainMarket: Portfolio MVP Completion — Design

**Date:** 2026-11-05
**Owner:** GitHub user Aashish257
**Status:** Draft, waiting for owner approval

Calls marked **[Claude's call]** were made by Claude during design and were not decided by the owner. The owner can override any of them.

---

## 1. Intent and why

SustainMarket is a full-stack marketplace (React + Vite, Node/Express, MongoDB, Socket.io) that connects local sustainable sellers in India with eco-conscious buyers. It already has role-based auth, a product catalog with a 0–10 sustainability score, live auctions, buyer–seller chat, cart/checkout with Razorpay (sandbox), a seller dashboard and an admin panel. There are 63+ backend Jest tests, Vitest component tests and Playwright E2E tests.

**The goal is to get the owner hired** as a web developer / AI–GenAI developer. Recruiters and interviewers must be able to:

1. open a **live hosted link**, understand the product in under two minutes and click through every role with demo accounts;
2. see **one meaningful GenAI feature** that solves the product's core problem rather than decorating it;
3. open a **clean, professional GitHub repo** with a README that tells the story;
4. hear the owner quote **real measured numbers** (tests, performance, AI accuracy).

If the result is strong, it may later become a real product for real sellers and buyers. That's a bonus and must not slow down the portfolio goal.

**Speed matters.** There is no fixed deadline, but the owner wants to finish as soon as possible so they can apply for jobs and move on to other projects. Phases are ordered so a live link exists early and every phase ends in a deployable, demoable state.

### The problem the product solves (from `doc/01_problem_statement.md`)

1. Local sustainable producers have no central, visible place to sell.
2. **Ecological impact is opaque, and greenwashing is everywhere.** Buyers can't tell real sustainability claims from marketing.
3. Buyers don't trust small, unknown sellers.

Problems 2 and 3 are the product's whole point, and today the app fails both (see §2).

---

## 2. Current state: what's wrong today

Found by reading the docs and code and by screenshotting every role (2026-11-05):

**Trust and honesty (most serious)**
- The four pillar scores on the product page are **fake**: they're computed as `overallScore × 0.96 / 1.02 / 0.94…` in `frontend/src/shared/components/ScoreRadar.jsx`.
- Claims like "Zero single-use plastic" and "Local radius under 150km" are **hardcoded** in `frontend/src/modules/product/pages/ProductDetail.jsx` and appear on every product.
- Every seller shows a **"Verified Producer / Verified Artisan" badge**, but no verification exists (the user model has no such field).
- The landing page shows invented stats ("100% origin proven", "0.0g single-use plastic").
- Products and sellers have **no location**, although this is a *local* marketplace.

**Missing account features**
- The profile page is read-only. The user model only has name, email, password and role.
- No edit profile, change password, forgot/reset password, saved addresses, seller shop profile, public shop page, wishlist, notification settings, delete account or data export.

**UI looks AI-generated and is confusing (owner's main complaint)**
- AI-template tells: a pill badge above every heading, tiny ALL-CAPS labels everywhere, identical rounded shadow cards, buzzword copy ("Catalog Product Nodes", "SYSTEM // 01", "Inspect Ledger", "escrow"), leaves floating over the hero text.
- The navbar is a row of unlabeled icons (theme, bell, chat, bag). There's no "Sell" entry for buyers, and the "LOCAL VERIFIED" tagline under the logo reads like a claim.
- Seller and admin areas have **two menus doing the same job** (a top bar and a sidebar with the same links), so the workspaces feel mixed with the buyer site.
- **Auction products are hard to find.** The marketplace shows only buy-now products, with one small text link to auctions, and cards have no type badge.
- The review section is a black box on a light page.

**Data**
- Seed and test data is obviously fake ("E2E Bamboo Bottle", grey placeholder images).
- Payments run in simulated mode unless real Razorpay test keys are set.

**Repo**
- The root holds notes from other AI tools (`brain.md`, `STATE.md`, `Sustainable_Local_Marketplace_Frontend_Rebuild_Plan.md`, `audit Report/`), a duplicate `seed.js` (root and `backend/`), `backend/error.log`, and both `doc/` and (now) `docs/`.
- A large amount of uncommitted work sits on branch `dev`.
- Deployment groundwork exists (`render.yaml`, `.github/workflows/ci.yml` and `cd.yml`, `doc/DEPLOY.md`, `backend/Dockerfile`) but nothing is live.

---

## 3. Goals, non-goals, anti-goals

### Goals
- G1. A live, stable demo at a public URL, with demo accounts for buyer, seller and admin shown on the login page.
- G2. The **AI Sustainability Checker** (§5) is the headline feature and works end to end.
- G3. **Nothing on the site is fake.** Every score, badge and stat comes from real data or is clearly labeled as demo data.
- G4. A UI that looks designed by a professional, with clear navigation per role.
- G5. Complete account and trust features (§6).
- G6. A realistic catalog built from real data sources (§7).
- G7. Security designed per feature (§9).
- G8. Measured numbers recorded with method and date (§11), feeding the README and the owner's resume.
- G9. A professional repo and GitHub workflow (§12).

### Non-goals
- A mobile app, or a PWA beyond a responsive site.
- Live (real-money) Razorpay. Test mode with real test keys is enough.
- Logistics integration, multi-currency, or international sellers.
- Sellers bringing their own AI API keys (the owner chose operator-configured keys only).
- A general shopping chatbot. A natural-language search assistant is a possible **later** extra, not part of this scope.
- Rewriting the stack. Keep React/Vite/Tailwind v4/Zustand/React Query and Express/Mongoose/Socket.io.

### Anti-goals (failure even if it technically works)
- Any number, score, badge or claim on the site that isn't backed by data. In an anti-greenwashing app that's fatal in an interview.
- An AI feature that's decorative or easy to break (e.g. a seller can prompt-inject a 10/10).
- A UI that still looks like an AI template.
- Breaking existing features or tests, or dropping test coverage.
- Secrets committed to git, or a demo that leaks AI credits to abuse.
- A demo that's down or takes a minute to load when a recruiter clicks.

---

## 4. Phases and order

**[Claude's call]** on the order. It's optimized for "live link first, strongest interview value next". Each phase ends with merge to `main`, an auto-deploy, and a short check on the live site.

| # | Phase | Demo-able outcome |
|---|---|---|
| 1 | Repo cleanup + first deployment | Clean repo, live link (current features) |
| 2 | Real data foundation | Realistic catalog and photos on the live site |
| 3 | AI Sustainability Checker | Headline GenAI feature live; fake scores gone |
| 4 | UI redesign foundation | New nav, separate workspaces, auction clarity, de-AI'd look |
| 5 | Accounts and trust | Profile settings, password reset, addresses, shop pages, location, real verification |
| 6 | Measure and prove | Metrics doc, README, resume bullet points |

Phase 3 depends on Phase 2 (its evaluation uses the Open Food Facts set). Phase 5 builds its new pages on the Phase 4 design rules. Phases 1→6 run in sequence. Within a phase the builder may parallelize.

---

## 5. AI Sustainability Checker (headline feature)

### What it does
When a seller creates or edits a product, they describe materials, packaging, origin, production and transport in plain words. They click **Check with AI**. The AI returns:

- a score of 0–10 for each of four pillars: **Sourcing, Packaging, Carbon, Water**, each with a one-line reason;
- an **overall score**, computed by the server as the plain average of the four pillars **[Claude's call]**, not by the model;
- **flags** for vague or unsupported claims (e.g. "100% eco-friendly", "all natural" with no evidence), quoting the seller's own words;
- **one improvement tip**;
- a 1–3 sentence **buyer-facing summary** ("Why this score?").

The seller can **accept the AI scores** or **edit them** (owner decision). If the published scores differ from the AI's, the product is marked **seller-adjusted**. Both the AI's and the seller's values are stored.

### Where it shows up
- **Seller, Add/Edit Product:** a description field, the "Check with AI" button, a result panel, and "Use these scores" / "Edit myself" (see the approved mockup: seller panel left, buyer panel right). A product can't be published without a check result **[Claude's call]**, so no product is left with an unexplained score.
- **Buyer, Product Detail:** the existing score ring, plus the radar chart fed by the **real stored pillar scores**, plus a "Why this score?" box with an **AI-checked** badge, or **Seller-adjusted** when the seller changed the scores. The hardcoded claims and fake multipliers are removed.
- **Buyer, catalog:** filtering by minimum score uses the real overall score.
- **Admin, AI Settings page:** pick the active provider and model from the providers whose API keys are set on the server; a "test connection" button; usage counters (checks today, failures, average latency).
- **Admin, Score Review list:** products where the seller's score is **≥ 2 points above** the AI's **[Claude's call on the threshold]**, so admins can review possible greenwashing.

### Providers (owner decisions)
- Supports **Gemini, Groq, Claude (Anthropic) and OpenAI** behind one internal interface. The rest of the code never imports a provider SDK directly.
- **Keys live only in server environment variables.** Sellers never see or supply keys. The admin page chooses *which* configured provider is active. It never displays or stores keys.
- The first live provider is **Gemini** (the owner has a Gemini key). Default model: the provider's current small or fast tier, chosen by the builder.

### Behavior and robustness
- The model must return **structured JSON**, validated with Zod on the server. Scores are clamped to 0–10. On invalid output, retry once, then fail with a friendly "AI check unavailable, try again" message. The seller can still save a draft.
- **Prompt-injection defense:** the seller's text is passed as clearly delimited data. The system prompt tells the model to ignore instructions inside it. The server, not the model, computes the overall score. Admins can see flagged gaps.
- **Cost and abuse limits:** only sellers can call it; a per-seller daily cap (default 20 checks/day **[Claude's call]**); a global daily cap set in env; results cached by a hash of the input text, so re-checking an unchanged description costs nothing; input length capped (e.g. 2,000 chars).
- A timeout of about 20 s. Errors are logged without the seller's full text.
- Each stored result records provider, model, prompt version, input hash, timestamp and latency.

### Data model change
The product gets a `sustainability` sub-document holding pillars (score + reason), flags, tip, buyer summary, AI-original values, the seller-adjusted flag and metadata. The existing `sustainabilityScore` number stays as the overall score for filtering, sorting and backward compatibility. Existing products are migrated: they're marked "not yet checked" and shown as such until re-checked, never with made-up pillars.

### Evaluation (feeds §11)
A script runs the checker over a held-out set of Open Food Facts products that have an eco-score, then compares results. Metrics: mean absolute difference after mapping the eco-score to 0–10, and how often the AI lands in the same broad band (e.g. A–B / C / D–E). The README must state that Open Food Facts uses a different (EU lifecycle) method, so this measures agreement, not truth. A second small hand-labeled set of greenwashing examples measures flag detection (e.g. "caught 9 of 10 vague claims").

---

## 6. Accounts and trust features

**Must have**
1. **Edit profile:** name, phone, avatar (upload through the existing upload module).
2. **Change password** (requires the current password). Changing it invalidates other sessions; `tokenVersion` already exists.
3. **Forgot / reset password** by email: a single-use token that expires in about 30 minutes, with the same response whether or not the email exists.
4. **Saved addresses** (several, one default), selectable at checkout.
5. **Seller shop profile:** shop name, story/bio, photos, pincode → city/district/state.
6. **Public shop page** (e.g. `/shops/:id`): story, location, verification status, average rating, all products. Product pages link to it.
7. **Location.** Sellers set a pincode. The server looks it up once through `api.postalpincode.in` and stores district/state. Buyers can set their pincode too. Products show **"Same district" / "Same state"** badges, and the catalog gets a "Near me" filter. Real km distance is optional and only added if a reliable free pincode→coordinates dataset is found **[Claude's call]**. Results are cached, and the site keeps working if the lookup API is down.
8. **Real seller verification:** the seller submits a verification request (shop details plus an optional supporting photo or document). An admin approves or rejects it with a note. Only approved sellers get the **Verified** badge. All existing fake badges are removed.

**Should have** (Phase 5, after must-haves)
9. **Wishlist** (save products, including auctions).
10. **Notification settings** (which in-app or email notifications to receive).
11. **Delete account** and **download my data** (JSON), matching the consent fields that already exist.

---

## 7. Data sources

Verified 2026-11-05:

- **Open Food Facts** (food). Real Indian products with eco-score, CO₂ (Agribalyse) and photos. For example, Parle-G returned eco-score D (37) and 3.59 kg CO₂/kg. License: database ODbL, photos CC-BY-SA, so attribution is required and shared data stays open. The API is **rate-limited (~15 reads/min, and search was throttled during testing)**, so the site **never calls it live**. A one-time import script (bulk export or a slow, polite crawl with a custom User-Agent) stores a curated set of a few hundred products. Uses: (a) the AI evaluation set; (b) a "reference products" comparison on product pages is **optional** and left to the builder. These are brand products, **not** local sellers, so they are not listed as marketplace items.
- **India Post pincode API** (`api.postalpincode.in`). Returns district/state for a pincode. No coordinates. Free, no key. Cache the results.
- **Local seller catalog.** No open eco-data source exists for crafts, fashion or home goods. About 40 realistic listings are written across the existing categories and 8–12 demo sellers in a few Indian cities, with photos from Unsplash or Pexels (license-compliant and credited). **Every listing's scores come from running the real AI checker** on its description, so none are made up. Demo data is labeled in the footer ("Demo listings for portfolio purposes").
- An attribution page or footer section credits Open Food Facts, India Post and the photo sources.

---

## 8. UI redesign: rules and user flows

The builder chooses exact visuals within these rules. The existing palette, fonts and dark mode stay, refined rather than replaced.

### Structure
- **Buyer site:** a top navbar with **text labels**: Marketplace, Auctions, Sell, plus a search box. On the right: cart (with count), messages, notifications and an avatar menu (Profile, Orders, Wishlist, Settings, Logout). The theme toggle moves into the avatar menu or footer. On mobile, a hamburger drawer holds the same items.
- **Seller and admin workspaces:** their own app shell with a **sidebar only** and a slim top bar showing the workspace name, "Back to marketplace" and the avatar menu. No duplicate top menu. Admin and seller look clearly related but distinct (e.g. a different accent strip and workspace label).
- **Catalog:** the marketplace shows **all products** with tabs **All / Buy now / Auctions**. Cards carry a clear type badge ("Auction · ends in 2h · current bid ₹1,200" vs. price + Add to cart), a location badge and the score.

### De-AI rules
- No pill badge above every heading. No stats that aren't real. No buzzword copy. Plain words ("Products", "Orders", "Users").
- ALL-CAPS only for rare small labels. Body text at least 14–16 px. A clear hierarchy, so each page has one primary action.
- Vary the layout. Not every block should be the same card.
- 3D/Three.js effects only where they don't hurt readability or speed. No decoration over text. The builder may remove some.
- Review and other sections use the page theme, not a black box on a light page.
- Accessibility at WCAG 2.1 AA (contrast, focus states, labels). The existing a11y work stays.
- The builder may use the project's `unslop-ui` / `ui-ux-pro-max` skills as checklists.

### Key user flows (each must work end to end on the live site)
- **Buyer:** land → browse/search/filter (type, category, score, near me) → product (score + "why") → add to cart or bid → checkout with a saved address → test payment → order tracking → review. Can message the seller from the product or shop page.
- **Seller:** register → shop setup (shop name, pincode, story) → request verification → add a product with the AI check → manage orders (paid → shipped → delivered) → analytics.
- **Admin:** dashboard → approve products → verify sellers → score review list → AI settings → users and orders.
- **Guest:** browse everything; buying, bidding or messaging prompts a login. The login page shows the demo accounts.

---

## 9. Security, per feature

The existing baseline (JWT 7d, bcrypt, helmet, rate limits, Zod validation, RBAC, ownership checks) stays and applies to all new endpoints. Every new route gets Zod validation and an RBAC check plus tests for the forbidden cases.

| Feature | Security rules |
|---|---|
| AI checker | Seller-only. Per-seller and global daily caps. Input length cap. Prompt-injection guard. Zod on model output. Server computes overall. Keys only in env, never logged or returned. Admin AI settings admin-only and never shows keys. |
| Password reset | Random single-use token stored hashed, ~30 min expiry. Same response for unknown emails. Rate-limited per IP and per email. Resetting bumps `tokenVersion`. |
| Change password | Requires current password. Bumps `tokenVersion`. |
| Profile and addresses | User can only read or edit their own. Phone and address never shown publicly. |
| Uploads (avatar, shop, verification docs) | Type and size limits (existing upload module). Verification documents visible only to the owner and admins. |
| Shop page | Public fields only (no email/phone unless the seller opts in). |
| Verification | Only admins approve. Every decision is logged with admin id and time. |
| Location lookup | Server-side only, cached, with a timeout. Pincode validated (6 digits). |
| Wishlist | Own data only. |
| Delete / export | Re-enter password. Export contains only the user's own data. Delete anonymizes the user's orders and reviews instead of breaking other users' records. |
| Payments | Existing HMAC verification. Test keys only. Sandbox mode clearly labeled. |
| Chat / auctions | Existing socket auth and bid checks stay. |
| Everywhere | CORS locked to the frontend origin in production. No secrets in git (`.env.example` only). Dependency audit in CI. |

---

## 10. Deployment

**[Claude's call]** on the target setup, all free tier:

- **Frontend:** Vercel, with preview deploys on pull requests.
- **Backend:** Render web service from the existing `render.yaml`, auto-deployed from `main`, with Redis disabled (already supported).
- **Database:** MongoDB Atlas M0. **Images:** Cloudinary (already wired).
- **Email (password reset):** a free transactional email provider; the builder chooses.
- **Cold starts:** Render free sleeps when idle. To meet "no one-minute load", the builder sets up a free uptime ping and/or shows a friendly "waking up the server" state in the UI.
- **CI:** existing lint and tests on every PR, plus the E2E suite.
- **CD:** simplified to platform auto-deploys. The current Docker Hub push in `cd.yml` is kept only if it's still useful; the builder decides.
- Production seeding runs as a one-off script, never automatically on deploy.
- **Public demo safety [Claude's call]:** the demo accounts shown on the login page are shared with strangers, so: the demo **admin** is read-only (it can view everything, but destructive actions like deleting users, changing roles or purging products are blocked with a "disabled in demo" message); the demo seller's AI checks count against a small separate cap; and a scheduled job (e.g. a nightly GitHub Action) resets demo data to the seed state. The owner keeps a private, full admin account.
- **Owner prerequisites:** free accounts on Vercel, Render, MongoDB Atlas, Cloudinary and the email provider, plus the Gemini API key, all added as platform env vars or secrets. The builder gives step-by-step instructions when each is needed.
- `docs/DEPLOY.md` is updated with the exact steps, env vars and how to redeploy.

---

## 11. Measure and prove

All numbers are **measured, never estimated**, and recorded in `docs/METRICS.md` with date, environment and method, so the owner can defend them in an interview:

- Test counts and coverage (backend Jest, frontend Vitest, Playwright E2E).
- Lighthouse scores (performance, accessibility, best practices, SEO) on the **deployed** site for key pages.
- API load test (k6 or autocannon) on key endpoints: p50 and p95 latency and throughput, stating where it ran.
- Live bid broadcast delay versus the 200 ms target in the problem statement.
- AI checker: agreement with Open Food Facts, vague-claim detection rate, average latency and estimated cost per check.
- The README gets a "By the numbers" section, and a short list of resume bullet points is drafted from these numbers.

---

## 12. Repo and GitHub

- First, run the full test suites, then commit the existing uncommitted work on `dev` in logical commits, checking that nothing secret is included. The owner confirmed this work is finished and working.
- **Branching (owner decision):** all new work happens on a **new branch**, never directly on `main`. Each phase (or sub-feature) gets its own branch, created from the up-to-date `dev` work. A branch is merged into `main` only when its tests pass, CI is green and it works without errors. Merging to `main` triggers the deploy.
- Merge `doc/` into **`docs/`** (one docs folder). Move the AI-tool notes (`brain.md`, `STATE.md`, rebuild plan, `audit Report/`) into `docs/archive/` instead of deleting them **[Claude's call]**. Remove the duplicate root `seed.js` after confirming the backend copy is the real one. Gitignore logs, coverage, `dist-e2e/`, `.superpowers/` and `.env` files.
- The root keeps a clear layout: `backend/`, `frontend/`, `docs/`, `.github/`, `README.md`, `docker-compose.yml`, `render.yaml`, `LICENSE`.
- **README:** one-line pitch, live link, demo accounts, screenshots/GIF, the AI checker story, architecture diagram, tech stack, "By the numbers", how to run locally, and attributions.
- **Workflow:** `main` = production (protected, CI required). Short-lived feature branches (e.g. `feat/phase-3-ai-checker`), merged by PR, with Conventional Commits (already in use). Each PR has a short description.
- GitHub repo polish: description, topics, website link to the live demo, pinned on the owner's profile.

---

## 13. Interview story (what all this adds up to)

> "I built a local sustainable marketplace. Its core problem is greenwashing, so I added a GenAI Sustainability Checker that scores products on four pillars, explains why, and flags vague claims. It works with Gemini, Groq, Claude or OpenAI behind one interface, and it's hardened against prompt injection and cost abuse. I measured it against Open Food Facts eco-scores. It also has real-time auctions and chat over Socket.io, Razorpay payments with HMAC verification, role-based workspaces, and [N] automated tests. It's live at [URL]."

---

## 14. Left to the builder

- Library choices within the existing stack (e.g. the email provider, the load-test tool).
- Exact visual styling within §8's rules.
- Exact prompts, the model tier per provider, and the JSON schema field names.
- API route names and data model field names, following the existing module structure (`routes / controller / service / validation / repository`).
- How to split phases into PRs and tasks.
- Whether the "reference products" comparison (§7) is worth adding.
