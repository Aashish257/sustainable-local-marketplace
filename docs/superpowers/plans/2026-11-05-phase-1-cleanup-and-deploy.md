# Phase 1: Repo Cleanup + First Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current `dev` work into a clean, professional repo and get the existing app live on a public URL, safe to share with strangers.

**Architecture:** Commit the finished `dev` work, then do all Phase 1 changes on branch `chore/phase-1-cleanup-deploy`. Add three small, tested backend/frontend changes the live demo needs (read-only demo admin, explicit sandbox payments in production, a "waking up" notice for free-tier cold starts). Deploy the frontend to Vercel, the API to Render (existing `render.yaml`) and the database to MongoDB Atlas M0. Merging to `main` is the deploy.

**Tech Stack:** Node 20 / Express / Mongoose / Jest + Supertest + mongodb-memory-server; React 19 / Vite / Vitest / Playwright; GitHub Actions; Vercel; Render; MongoDB Atlas.

**Spec:** `docs/superpowers/specs/2026-11-05-portfolio-mvp-completion-design.md` (§4 Phase 1, §9, §10, §12)

## Global Constraints

- Never commit to `main` directly. Work on `chore/phase-1-cleanup-deploy`, and merge to `main` by PR only when CI is green (owner rule).
- After each task, add a dated entry to `docs/PROGRESS.md` (owner rule).
- No secrets in git: only `.env.example` files are committed. Real values go in Render/Vercel dashboards or GitHub secrets.
- Nothing fake: demo data must be labeled as demo. Sandbox payments must be clearly labeled "Demo payment, no real money".
- Keep the existing stack and module pattern (`routes / controller / service / validation / repository`).
- Backend tests: `cd backend && npm test`. Frontend: `cd frontend && npm test`. E2E: `cd frontend && npm run e2e`. All must stay green.

## Review Focus

- A demo admin sending any non-GET admin request (role change, delete, approval, order status) must get 403 "disabled in the public demo", while a real admin still can. → Task 3 tests cover role change, delete user and product approval.
- `PAYMENT_SANDBOX` unset in production must still reject mock signatures (no free orders on a real deployment). → Task 4 test.
- A demo account's `isDemo` flag must come from the database, not the JWT, so a forged token can't drop it. → Task 3 test signs a token without the flag.
- The "waking up" notice must show once per slow burst and not on every slow request, and never when requests are fast. → Task 5 tests.
- Moving `doc/` to `docs/` must not leave broken links in README or docs. → Task 2 grep check.

---

### Task 1: Snapshot the finished `dev` work

**Files:** the 68 currently modified or untracked files on `dev` (the owner confirmed they're finished and working). Exclude `.superpowers/`, `graphify-out/` and the new `docs/` and `CLAUDE.md` files, which go in Task 2.

- [ ] **Step 1: Check for secrets**
Run: `git status --short` and `git diff | grep -iE "secret|password|api[_-]?key|mongodb\+srv"`
Expected: no real credentials. Only `.env.example` placeholders and test values like `password123` or `rzp_test_dummy`. If anything real appears, stop and ask the owner.

- [ ] **Step 2: Run all checks before committing**
Run: `cd backend && npm test`, then `cd frontend && npm test && npm run lint && npm run build`
Expected: all pass. Record the backend and frontend test counts in `docs/PROGRESS.md`. If lint fails, note it and continue. Lint is not yet enforced in CI.

- [ ] **Step 3: Commit in logical groups** (Conventional Commits, each ending with the Co-Authored-By line)
Suggested groups: `feat(upload): …` (backend/src/modules/upload, upload tests); `feat(cart): add cart validation`; `fix(backend): …` (remaining backend src changes); `test: …` (new/changed jest files, e2e-server); `feat(frontend): …` (frontend src changes); `chore: …` (package.json, .gitignore, ci.yml, .env.example). Use `git diff <file>` to write accurate messages.

- [ ] **Step 4: Push `dev`**
Run: `git push origin dev`
Expected: success. `git status` shows only the Task 2 files left untracked.

---

### Task 2: Professional repo layout on a new branch

**Files:**
- Create branch: `chore/phase-1-cleanup-deploy` from `dev`
- Move: `doc/*` → `docs/` (`git mv`)
- Move: `brain.md`, `STATE.md`, `Sustainable_Local_Marketplace_Frontend_Rebuild_Plan.md`, `doc/MASTER_IMPLEMENTATION_SPEC.md`, `doc/AUDIT_LOG.md` → `docs/archive/`
- Delete: root `seed.js` and `backend/seed.js`. The real seed is `backend/src/scripts/seed.js`, the one `DEPLOY.md` uses. First run `grep -rn "seed.js" --include=*.json --include=*.md --include=*.yml .` (excluding node_modules) and confirm nothing else references them.
- Leave `audit Report/` alone. It's already gitignored and stays local.
- Modify: `.gitignore` (add `.superpowers/`, `graphify-out/`, `frontend/dist-e2e/`)
- Add: `docs/superpowers/specs/…`, `docs/superpowers/plans/…`, `docs/PROGRESS.md`, `CLAUDE.md`
- Create: `LICENSE` (MIT, copyright holder "Aashish257", year 2026)

- [ ] **Step 1: Create the branch**
Run: `git switch -c chore/phase-1-cleanup-deploy dev`

- [ ] **Step 2: Do the moves, deletes and .gitignore edits listed above**

- [ ] **Step 3: Fix links**
Run: `grep -rn "doc/" --include=*.md . | grep -v node_modules | grep -v graphify-out | grep -v "docs/"`
Expected after fixing: no results pointing to the old `doc/` path (update README and moved docs).

- [ ] **Step 4: Verify that nothing broke**
Run: `cd backend && npm test` and `cd frontend && npm test && npm run build`
Expected: same counts as in Task 1.

- [ ] **Step 5: Commit**
`git commit -m "chore: reorganize docs, archive tool notes, add design, plan and progress log"`

---

### Task 3: Read-only demo admin (TDD)

The public demo shows its admin login on the login page, so strangers must not be able to delete users or change roles.

**Files:**
- Modify: `backend/src/models/user.model.js` (add `isDemo: { type: Boolean, default: false }`)
- Modify: `backend/src/middleware/auth.middleware.js`. `verifyAccessToken` also selects `isDemo` and returns `{ id, role, name, isDemo }`. Add `export const blockDemoWrites`.
- Modify: `backend/src/modules/admin/admin.routes.js` (add `router.use(blockDemoWrites)` after `authorize('admin')`)
- Modify: `backend/src/scripts/seed.js` (the three demo users get `isDemo: true`)
- Create: `backend/src/scripts/create-admin.js`. It creates or updates a non-demo admin from env `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME`, using the existing `hashPassword` from `src/utils/hash.js`. It refuses passwords under 12 characters and exits non-zero if a variable is missing.
- Test: `backend/tests/jest/demo-mode.test.js`
- Modify: `frontend/src/modules/auth/LoginPage.jsx`. Add a "Try the demo" panel listing Buyer `buyer@sustain.com`, Seller `seller@sustain.com` and Admin (read-only) `admin@sustain.com`, all with password `password123`. Each row has a "Use" button that fills the email and password fields. It's shown only when `import.meta.env.VITE_SHOW_DEMO_ACCOUNTS !== "false"`.
- Test: `frontend/src/modules/auth/LoginPage.test.jsx`. `clicking Use on Seller fills the form`: after the click, the email input has the value `seller@sustain.com` and the password input has `password123`.

**Interfaces:**
- Produces: `blockDemoWrites(req, res, next)`. If `req.user?.isDemo` is true and `req.method` isn't `GET`, `HEAD` or `OPTIONS`, it calls `next(new AppError("This action is disabled in the public demo.", 403))`. Otherwise it calls `next()`.
- Produces: the `req.user.isDemo` boolean (read from the DB, never from the token).

- [ ] **Step 1: Write the failing tests** in `demo-mode.test.js` (use `startDb/stopDb/clearDb/makeUser` from `helpers.js`; make a demo admin with `User.updateOne({_id}, {isDemo: true})` after `makeUser("admin")`)
  - `demo admin can read stats`: `GET /api/admin/stats` → 200
  - `demo admin cannot change a role`: `PATCH /api/admin/users/:id/role` `{ role: "seller" }` → 403, body error contains `"disabled in the public demo"`, and the target user's role is unchanged in the DB
  - `demo admin cannot delete a user`: `DELETE /api/admin/users/:id` → 403, and the user still exists
  - `demo admin cannot change product approval`: `PATCH /api/admin/products/:id/approval` `{ approved: false }` → 403
  - `real admin still can change a role`: the same PATCH with a non-demo admin → 200
  - `demo flag comes from the database`: the token is signed with `{ id, role: "admin" }` only (no isDemo), the user has `isDemo: true` in the DB, the PATCH → 403
  - `demo seller can still create a product`: demo seller `POST /api/products` with a valid body → 201 (writes outside `/admin` aren't blocked)

- [ ] **Step 2: Run and confirm they fail**
Run: `cd backend && npm test -- demo-mode`
Expected: the 403 tests FAIL (they get 200).

- [ ] **Step 3: Implement the model field, `verifyAccessToken` change, `blockDemoWrites`, the route wiring, the seed flags and `create-admin.js`**

- [ ] **Step 4: Run all backend tests**
Run: `cd backend && npm test`
Expected: all pass, including the 7 new tests.

- [ ] **Step 5: Commit**
`git commit -m "feat(admin): read-only demo admin and create-admin script"`

---

### Task 4: Explicit sandbox payments in production (TDD)

Today `verifyPaymentService` rejects all mock payments when `NODE_ENV=production`, so checkout on the live demo would fail without real Razorpay keys.

**Files:**
- Modify: `backend/src/modules/payment/payment.service.js:82`. `allowMock = process.env.NODE_ENV !== "production" || process.env.PAYMENT_SANDBOX === "true"`
- Modify: `backend/.env.example` and `render.yaml` (add `PAYMENT_SANDBOX`, with a comment: "true = demo payments, no real money. Never set on a real store")
- Modify: `frontend/src/modules/payment/pages/PaymentPage.jsx`. When the create-order response has `isTestMode: true`, show a visible notice: "Demo payment: no real money is charged." Keep the existing notice if it already says this.
- Test: `backend/tests/jest/order-payment.test.js` (add cases)

- [ ] **Step 1: Write the failing tests**
  - `production + PAYMENT_SANDBOX=true accepts a mock payment`: set `NODE_ENV=production` and `PAYMENT_SANDBOX=true` inside the test (restore them in `afterEach`), then `verifyPaymentService(mockPay(order._id))` resolves and the order status is `paid`
  - `production without PAYMENT_SANDBOX rejects a mock payment`: same setup without the flag → rejects with status 400

- [ ] **Step 2: Run and confirm the first one fails**
Run: `cd backend && npm test -- order-payment`

- [ ] **Step 3: Implement the one-line change, the env docs and the frontend notice**

- [ ] **Step 4: Run backend and frontend tests**
Expected: all pass.

- [ ] **Step 5: Commit**
`git commit -m "feat(payment): opt-in sandbox payments for the public demo"`

---

### Task 5: Cold-start "waking up" notice and keep-alive (TDD)

Render's free tier sleeps when idle, and the first request can take 30–60 s.

**Files:**
- Create: `frontend/src/services/wakeNotice.js`
- Modify: `frontend/src/services/apiClient.js` (call `trackRequestStart()` in the request interceptor and `trackRequestEnd()` in both response handlers)
- Test: `frontend/src/services/wakeNotice.test.js`
- Create: `.github/workflows/keep-alive.yml`. Schedule `*/14 * * * *` plus `workflow_dispatch`. It runs `curl -fsS --max-time 90 "$API_HEALTH_URL"`, where `API_HEALTH_URL` is a repository variable (`vars.API_HEALTH_URL`). The job is skipped if the variable is empty.

**Interfaces:**
- Produces: `trackRequestStart(): void`, `trackRequestEnd(): void`, `resetWakeNotice(): void` (for tests). Constants `WAKE_DELAY_MS = 4000` and the message `"Waking up the server… free hosting sleeps when idle, this can take up to a minute."`. It shows one `react-hot-toast` loading toast with id `"wake"` when at least one request has been pending for 4000 ms, and dismisses it when the pending count reaches 0.

- [ ] **Step 1: Write the failing tests** (Vitest fake timers; mock `react-hot-toast`)
  - `shows the notice once when a request takes over 4s`: start one request, advance 4000 ms → `toast.loading` called once with the message and `{ id: "wake" }`
  - `does not show for fast requests`: start, advance 3000 ms, end, advance 5000 ms → `toast.loading` not called
  - `shows only once for many slow requests`: start 3 requests, advance 10000 ms → called once
  - `dismisses when all requests finish`: after showing, end all → `toast.dismiss("wake")` called

- [ ] **Step 2: Run and confirm failure**
Run: `cd frontend && npx vitest run src/services/wakeNotice.test.js`

- [ ] **Step 3: Implement `wakeNotice.js`, wire it into `apiClient.js` and add `keep-alive.yml`**

- [ ] **Step 4: Run all frontend tests**
Run: `cd frontend && npm test`
Expected: all pass.

- [ ] **Step 5: Commit**
`git commit -m "feat(frontend): waking-up notice for cold starts, keep-alive ping"`

---

### Task 6: CI/CD for platform auto-deploys

**Files:**
- Delete: `.github/workflows/cd.yml`. It pushes to Docker Hub and SSHes into a VPS that doesn't exist, so it would fail on every push to `main`. Render and Vercel auto-deploy from GitHub instead. The `Dockerfile`s and `docker-compose.yml` stay for local and self-hosting use.
- Modify: `.github/workflows/ci.yml`. Add a `npm audit --omit=dev --audit-level=high` step to the backend-lint and frontend-build jobs (spec §9). If it reports high or critical issues, fix them with `npm audit fix` (not `--force`) and re-run the tests. If a fix needs a breaking upgrade, stop and report it to the owner.

- [ ] **Step 1: Make the changes and run `npm audit --omit=dev --audit-level=high` locally in `backend/` and `frontend/`**
Expected: exit code 0 in both.

- [ ] **Step 2: Commit and push the branch, then open a PR to `main`**
`git commit -m "ci: drop unused VPS deploy, add dependency audit"` then `git push -u origin chore/phase-1-cleanup-deploy` and `gh pr create --base main` (the body ends with the Claude Code attribution line)
Expected: all CI jobs pass (backend tests, frontend build, E2E). **Don't merge yet.** Deployment (Task 7) must be configured first.

---

### Task 7: First deployment and live smoke test

Steps marked **Owner** need the owner's browser and accounts. Claude gives exact click-by-click instructions when each comes up and never asks for passwords in chat.

**Files:**
- Modify: `render.yaml` (add `PAYMENT_SANDBOX: "true"`. Keep `healthCheckPath: /`)
- Modify: `docs/DEPLOY.md` (rewrite as the exact steps actually used, including the env var table for Render and Vercel, how to seed, how to create the owner admin and how to redeploy)
- Modify: `README.md` (add the live link and demo accounts at the top. The full README rewrite is Phase 6)

- [ ] **Step 1 (Owner): Create a MongoDB Atlas M0 cluster**, a database user and network access `0.0.0.0/0` (Render IPs change), then copy the connection string.
- [ ] **Step 2 (Owner): Render → New → Blueprint → pick the repo, branch `main`.** Set `MONGO_URI`, plus `CLIENT_URL` (filled in after Step 4) and the Cloudinary vars (optional). Razorpay vars stay empty because sandbox mode is on.
- [ ] **Step 3: Merge the PR to `main`** after CI is green. Render deploys.
Verify: `curl -s https://<render-app>.onrender.com/` returns the health JSON with HTTP 200.
- [ ] **Step 4 (Owner): Vercel → import the repo, root directory `frontend`.** Env: `VITE_API_BASE_URL=https://<render-app>.onrender.com/api`, `VITE_SOCKET_URL=https://<render-app>.onrender.com`. Then set Render `CLIENT_URL` to the Vercel URL and redeploy Render.
- [ ] **Step 5: Seed production once and create the owner admin**
Run locally with the Atlas URI in the shell (never in a file that gets committed): `cd backend && MONGO_URI="…" node src/scripts/seed.js` (safe to re-run: it resets only demo data), then `MONGO_URI="…" ADMIN_EMAIL=… ADMIN_PASSWORD=… ADMIN_NAME=… node src/scripts/create-admin.js` (the owner types the values).
- [ ] **Step 6 (Owner): Add the GitHub repository variable `API_HEALTH_URL`** = the Render URL, then run the keep-alive workflow once by hand.
- [ ] **Step 6b (Owner): Add the GitHub repository secret `MONGO_URI`** (the Atlas URI), then run the "Reset public demo data" workflow once by hand. Expected: "Demo reset: 3 demo accounts, 8 products".
Expected: green run.
- [ ] **Step 7: Smoke test the live site** (Playwright against the Vercel URL, or by hand)
  - Guest: home, marketplace and a product page load. The first load shows the waking-up notice if the server was asleep.
  - Buyer `buyer@sustain.com`: add to cart → checkout → pay. The "Demo payment" notice shows and the order becomes paid.
  - Seller `seller@sustain.com`: sees the order and marks it shipped.
  - Two browsers: a live bid shows up in the other one without refreshing. Chat delivers both ways.
  - Demo admin `admin@sustain.com`: dashboards load. Changing a user's role shows "disabled in the public demo".
  - The owner admin can change a role.
Expected: all pass. Fix anything that fails on a new branch from `main`.
- [ ] **Step 8: Update `render.yaml`, `docs/DEPLOY.md`, README live link and `docs/PROGRESS.md`; commit on a branch `docs/deploy-notes`, PR, merge**

---

## Done when
- `main` is deployed, and the live link works for all three demo roles plus the owner admin.
- The repo root contains only `backend/`, `frontend/`, `docs/`, `.github/`, `README.md`, `LICENSE`, `CLAUDE.md`, `docker-compose.yml`, `render.yaml`, `package.json`, `package-lock.json`, `.gitignore`.
- `docs/PROGRESS.md` shows Phase 1 done, with the test counts and the live URLs.
