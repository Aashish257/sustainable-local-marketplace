# Audit & Fix Log

Tracks every audit finding, fix step, and command. Code changes are made by Aashish; this file records them.
Final report is built from this file at the end.

## Session 1 — 2026-10-20: Audit of existing code vs Execution Plan (14 items)

Commands used (read-only):
- `grep -rn -E "trust proxy|rateLimit|consent|timingSafeEqual|currentBid|redis.keys|bcrypt.hash" backend/src`
- `sed -n` on app.js, payment.service.js, cache.middleware.js, bid.socket.js, auth.validation.js

| # | Item | Status | Evidence |
|---|------|--------|----------|
| NEW-A | Register accepts `role: "admin"` (anyone can become admin) | BUG (critical) | modules/auth/auth.validation.js:7 |
| 1 | consentGiven | Missing (no crash, feature gap) | not in user.model.js, schema, RegisterPage |
| 2 | trust proxy / limiter key | BUG | app.js:33-47, no `trust proxy` |
| 3 | Atomic bids | BUG (race) | bid.controller.js:42-52, socket/bid.socket.js:27-41 |
| 3b | Socket uses `product.price`, REST uses `biddingStartingPrice` | Inconsistent | bid.socket.js:31 vs bid.controller.js:43 |
| 4 | Product detail cache with stale bid | OK (only list is cached) | product.routes.js:14 |
| 4b | `redis.keys()` for invalidation | Fix (use SCAN) | cache.middleware.js:49 |
| 5 | Signature compare | Weak (`!==`, not timing-safe); test-mode bypass strings | payment.service.js:73-86 |
| 5b | No idempotency (already-paid order re-verified) | BUG | payment.service.js:~95 |
| 6 | Stock `$inc` without guard → can go negative / oversell | BUG | payment.service.js:105 |
| 7 | Socket scaling | OK (Redis adapter present; run 1 instance) | socket/index.js:34 |
| 8 | Sentry | N/A (not installed) | — |
| 9 | Order 5 states | OK | order.model.js:22 |
| 10 | /payments/create | OK (extra alias /create-order) | payment.routes.js:9-10 |
| 11 | bcrypt rounds hard-coded 10 | Fix (BCRYPT_ROUNDS env) | utils/hash.js:4 |
| C | Catalog isApproved/isActive filter | Missing (fields not on Product) | models/product.model.js |
| D | CORS fallback `*` | Fix for prod | app.js:25 |
| E | No jest/supertest in devDependencies | Gap | backend/package.json |

## Fix order (one step at a time)
1. NEW-A admin role on register
2. #2 trust proxy + limiter key
3. #6 + #5b stock guard + idempotency
4. #5 timing-safe signature + gate test bypass on NODE_ENV
5. #3/#3b atomic bids
6. #11 BCRYPT_ROUNDS
7. #4b SCAN invalidation
8. C isApproved/isActive
9. #1 consent
10. D CORS, E test tooling

## Change log
| Step | Date | File(s) | Change | Verified by |
|------|------|---------|--------|-------------|
| 1 | 2026-10-20 | backend/src/modules/auth/auth.validation.js:7 | role enum `["buyer","seller","admin"]` → `["buyer","seller"]` | `curl POST /api/auth/register role=admin` → HTTP 400 invalid_enum_value ✅ |
| 2 | 2026-10-20 | backend/src/app.js:23 | `app.set("trust proxy", 1)` (+ pre-existing limiter edits: prod 5/h, dev 50/15m, limiter on /register) | 51 logins with XFF 3.3.3.3 → 50×400 + 1×429; XFF 4.4.4.4 → 400 ✅ |
| — | 2026-10-20 | commit `ef15a52` on dev | `fix(auth): block admin self-registration and trust proxy for rate limiting` (steps 1+2) | `git add <2 files>; git commit -m ...` |
| 3 | 2026-10-20 | product.repository.js (`decrementStockIfAvailable`), order.model.js (`refundStatus`), payment.service.js (idempotency 409 + atomic reserve + rollback + cancel/refund) | Fixes #6 oversell and #5b double-verify | `node tests/step3-stock-test.mjs` → A pays 200/stock 0; A again 409; B 409, order B cancelled, refundStatus requested ✅ |
| 4 | 2026-10-20 | payment.service.js (edited by Claude at user's request) | NEW critical: `mock_` signature bypass worked in production → gate `isMock` on `NODE_ENV !== "production"`; `!==` → length check + `crypto.timingSafeEqual`, AppError 400 | `node tests/step4-signature-test.mjs` → mock_/order_test_/short sig all 400 in prod; valid HMAC passes; step3 test still green in dev ✅ |
| — | 2026-10-20 | commits `1e86c4a` (step 3), `e839ddc` (step 4) on dev | fix(payment) commits | user ran git add/commit |
| 5 | 2026-10-20 | product.model.js (`currentBid`, `currentBidder`), NEW modules/bid/bid.service.js (`placeBid`), bid.socket.js + bid.controller.js now call `placeBid` (by Claude) | #3 atomic bid via conditional findOneAndUpdate; unified floor (biddingStartingPrice‖price); checks biddingEnabled + biddingEndTime | `node tests/step5-bid-test.mjs` → 10 parallel equal bids: 1 ok/9×409; 10 rising parallel → currentBid 250; equal 409; below floor/disabled/ended 400 ✅ |
| 6 | 2026-10-20 | utils/hash.js (by Claude) | bcrypt rounds `10` → `Number(process.env.BCRYPT_ROUNDS) \|\| 12` | `bcrypt.getRounds()` → 12 default, 4 with BCRYPT_ROUNDS=4 ✅ |
| 7 | 2026-10-20 | middleware/cache.middleware.js (by Claude) | `redis.keys()` → `SCAN ... MATCH ... COUNT 100` loop | Redis down → logs error, no throw ✅. Real-Redis test PENDING (Docker not running) |
| 10 | 2026-10-20 | app.js (by Claude) | CORS: CLIENT_URL comma list; prod without it → blocked (was `*`) | server on :5055: prod no env → no ACAO; prod CLIENT_URL → exact origin; dev → `*` ✅ |
| NEW-B | 2026-10-20 | middleware/auth.middleware.js (by Claude) | `protect` returned 500 on missing/bad token → `AppError("Unauthorized", 401)` (frontend apiClient.js:32 relies on 401 for logout) | no token / bad token → 401 ✅; step3+step5 tests re-run green |
| 8 | 2026-10-20 | BACKEND (by Claude): product.model.js (`isApproved` default false + index, `isActive`); product.service.js (catalog filter `isApproved:true,isActive:true`; detail 404 for pending unless owner/admin); auth.middleware.js (`optionalAuth`); product.routes.js (`GET /:id` uses optionalAuth); product.controller.js (pass req.user); admin.controller.js + admin.routes.js (`PATCH /api/admin/products/:id/approval {approved}`, `GET /admin/products?status=pending\|approved`, cache invalidation); seed.js (`isApproved: true`); NEW scripts/backfill-approval.js. FRONTEND: AdminProducts.jsx (Status column, Approve/Reject button, status filter); SellerProducts.jsx ("Pending approval" badge); AddProduct.jsx (toast mentions approval) | Product moderation queue | `node src/scripts/backfill-approval.js` → 8 existing products approved. `node tests/step8-9-moderation-consent-test.mjs` (server on :5055) → 13/13 step-8 checks PASS; `npx vite build` OK |
| 9 | 2026-10-20 | user.model.js (`consentGiven`, `consentAt`); auth.validation.js (`consent: z.literal(true)`); auth.service.js (explicit field pick instead of `...data` → also blocks mass assignment); RegisterPage.jsx (required checkbox, submit disabled until ticked); tests run-tests.js/product-tests.js/review-tests.js send `consent: true` (by Claude) | Consent at signup | 4/4 step-9 checks PASS (no consent 400; consent 201; consentGiven true even if client sends false; consentAt set) |
| follow-up | 2026-10-20 | — | Not done: bidding/cart don't yet check `isApproved` (hidden products can't be found by guests, low risk); seller edit doesn't reset approval | logged for later |
| F1 Auction close | 2026-10-20 | BACKEND (by Claude): product.model.js (`auctionClosed`, `auctionWinner`); bid.service.js (`closeExpiredAuctions` with conditional update = exactly-once; `placeBid` now 404 for unapproved/inactive, 400 if closed, and the atomic filter re-checks `auctionClosed` + `biddingEndTime > now`); NEW jobs/auction.scheduler.js (sweep every `AUCTION_SWEEP_MS`, default 30s; emits `auction_closed` to `product:<id>` room; queues notification fire-and-forget); server.js starts scheduler; notification.worker.js `auction_closed` case; seed.js demo auction ends in 7 days. FRONTEND: BidPanel.jsx (countdown, `auction_closed` listener + cleanup, aria-live result banner: won / sold / no bids / finalising; hides bid form when ended) | DECISION: Mongo sweep instead of BullMQ delayed job — works with Redis down (fail-soft), recovers auctions missed during restarts, idempotent across instances; max close delay = sweep interval, late bids impossible because placeBid re-checks end time atomically | `node tests/auction-close-test.mjs` A1–A6 PASS; with server `AUCTION_SWEEP_MS=1000` + `API=...` B1–B2 PASS (socket event received). step5 test updated (`isApproved: true`) still 7/7; step8-9 17/17; step3 3/3; `npx vite build` OK |
| F2 Notifications | 2026-10-20 | BACKEND (by Claude): NEW models/notification.model.js (userId, type, message, link, isRead; indexes userId+createdAt, userId+isRead); NEW modules/notification/{service,controller,routes}.js — `notifyUser()` saves + emits to user room, never throws; `GET /api/notifications` → {items, unreadCount}, `PATCH /:id/read` (owner-only), `PATCH /read-all`, `DELETE /`; app.js mounts route. Hooks: bid.service.js (outbid → previous leader, uses `new:false` to get pre-update doc); bid.socket.js (removed room-wide "notification" spam); chat.socket.js (persisted, link /messages); payment.service.js (buyer "payment received", each seller "new paid order", buyer "cancelled + refund" on sold out); order.controller.js + admin.controller.js (buyer told new status); auction.scheduler.js (winner "you won", seller "sold / no bids"). FRONTEND: store/notificationStore.js (fetch from API, optimistic read/read-all/clear synced to API, `reset` on logout); App.jsx (fetch on login, reset on logout; keep server `_id`); Navbar.jsx (click marks only that one read) | Notifications survive refresh/offline; per-user, not per-tab | `node tests/notification-test.mjs` (server :5055) 18/18 PASS incl. live socket push + ownership 404 + bad id 400 + no token 401. Full suite re-run: step3 3/3, step5 7/7, auction 8/8 (with `AUCTION_SWEEP_MS=1000`), step8-9 17/17. `npx vite build` OK. Tests now clean up their notifications |
| 3-test | 2026-10-20 | backend/tests/step3-stock-test.mjs (new, by Claude) | Self-cleaning script calling verifyPaymentService directly | Note: AppError uses `err.status` (not `statusCode`) |
