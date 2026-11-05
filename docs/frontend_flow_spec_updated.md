# Frontend Flow Spec — Sustainable Local Marketplace

Derived from SRS, API spec, architecture, DB design. Maps every backend capability to a required screen/flow.

---

## 1. Global App Shell

- **Router.jsx**: route guards by role (buyer/seller/admin), redirect unauth users on protected routes to `/login`.
- **Auth state (Zustand)**: `{ user, token, role }`, hydrated from LocalStorage on load.
- **Theme state (Zustand)**: dark/light, synced to LocalStorage + `prefers-color-scheme`.
- **Socket connection**: init once after login (token in handshake auth), joins `user_${userId}` room automatically per Doc 5 §6.2. Disconnect on logout.
- **Global layout**: Navbar (role-aware links), glass theme wrapper, toast/notification listener (`notification` socket event → toast).

---

## 2. Auth Flow

| Screen | Route | Calls | Notes |
|---|---|---|---|
| Register | `/register` | `POST /api/auth/register` | Fields: name, email, password, role select (buyer/seller). On success: store token+user, redirect to role home. |
| Login | `/login` | `POST /api/auth/login` | On success: store token+user, connect socket, redirect. |
| Profile view | `/profile` | `GET /api/users/me` | Auth required. Read-only per FR-1.3 (no update endpoint documented — flag this gap to backend team). |

Guard: any route needing auth checks `token` exists + not expired (7d) → else redirect `/login`.

---

## 3. Buyer Flow

### 3.1 Catalog & Discovery
- **Home** `/`: hero + category bento grid (Three.js leaf canvas per Doc 6 §4). Public.
- **Catalog** `/products`: `GET /api/products?category&minPrice&maxPrice&page&limit`. Filter sidebar (category, price range), pagination controls. Cache-aware (backend Redis TTL 300s — no frontend action needed, just don't over-poll).
- **Product Detail** `/products/:id`: shows sustainabilityScore (0-10 badge), averageRating, totalReviews, images, seller link. Actions: Add to Cart, Chat with Seller, Join Auction (if applicable), Leave Review (buyers only, if purchased — note: ownership/purchase check not specified in API doc, confirm with backend).

### 3.2 Reviews
- Review form (rating 1-5 + comment) on Product Detail → `POST /api/reviews`. Optimistic UI update to averageRating not safe — refetch product after submit since backend recalculates atomically.

### 3.3 Cart & Checkout
- **Cart** `/cart`: client-side state (Zustand), no backend cart endpoint exists — cart built purely client-side until checkout.
- **Checkout** `/checkout`:
  1. `POST /api/orders` (items, totalAmount) → get local order id.
  2. `POST /api/payments/create` (orderId) → get Razorpay order options.
  3. Open Razorpay checkout modal (client SDK, not custom UI).
  4. On modal success → `POST /api/payments/verify` (order_id, payment_id, signature).
  5. Show success screen; on signature fail show retry/error state (400 response).
- **Order History** `/orders`: needs a list-orders-by-buyer endpoint — **not present in API spec, flag as missing backend route** before building this screen.

### 3.4 Chat (Buyer↔Seller)
- **Chat widget/page** `/messages` or inline drawer on Product Detail:
  - Socket emit `send_message({receiverId, content})`.
  - Listen `receive_message`, `message_sent` (own room echo), `notification`.
  - Typing indicator: SHOULD-level (FR-3.3) — emit/listen custom `typing` event (not formally specified, coordinate with backend before building).
  - History: needs a `GET` chat-history-by-thread endpoint — **not present in API spec**, only DB schema (messages collection) exists. Flag before building scroll-history UI.

### 3.5 Bidding (Buyer)
- **Auction room** on Product Detail (if product supports bidding — no `isAuction` flag defined in Product schema, flag to backend):
  - `join_product(productId)` on mount.
  - Emit `place_bid({productId, amount})`.
  - Listen `new_bid` → update live high-bid display for all room members.
  - Listen `bid_error` → inline validation message (bid too low).
  - Leave room on unmount.

---

## 4. Seller Flow

### 4.1 Dashboard
- **Seller Dashboard** `/dashboard`: role-guarded (seller only). Widgets: my products, my orders, revenue summary (no revenue endpoint specified — likely derived client-side from own products' orders, or flag as missing).

### 4.2 Product Management
- **My Products list** `/dashboard/products`: `GET /api/products?sellerId=me` (note: API spec doesn't show sellerId filter param explicitly — confirm, or fetch all + filter, or request backend add it).
- **Create Product** `/dashboard/products/new`: form incl. title, description, price, category, stock, sustainabilityScore, images → `POST /api/products`.
- **Edit Product** `/dashboard/products/:id/edit`: `PUT /api/products/:id`, ownership enforced server-side (403 if not owner).
- **Delete** inline action → `DELETE /api/products/:id`.

### 4.3 Chat (Seller side)
- Same socket pattern as buyer (§3.4), inbox view listing active threads — again needs thread-list endpoint (not in spec, flag).

### 4.4 Bidding (Seller side)
- Seller can view live bid activity per product (same `new_bid` listener), no separate seller bid-control events documented (no "close auction" emit specified — flag as missing feature per earlier gap analysis).

---

## 5. Admin Flow

- **Admin Panel** `/admin`: role-guarded (admin only).
- **User list** `/admin/users`: `GET /api/users` (403 for non-admins, confirm 403 handling shows friendly UI not raw error).
- **Moderation / disputes**: Doc 1 names this as an admin need, but no moderation or dispute endpoints exist in API spec — **entire admin moderation UI blocked until backend adds these routes**.
- **System metrics**: no metrics endpoint specified — flag as missing.

---

## 6. Cross-Cutting Frontend Concerns

- **RBAC-aware rendering**: hide/disable nav links and actions based on `role`, but never rely on frontend-only checks — backend 403 is source of truth; frontend just avoids showing dead-end UI.
- **Error handling**: global axios/fetch interceptor — 401 → clear session + redirect login; 403 → toast "not authorized"; 400 (Zod validation) → map field errors to form inputs.
- **Loading/caching UX**: since backend Redis-caches GET product routes (300s TTL), stale-after-mutation is possible for ~5min window on other users' views — acceptable, no special frontend handling needed beyond own optimistic refetch after own mutations.
- **Redis-down resilience**: no frontend impact — backend fails soft automatically (Doc 3 §4). No special UI state needed.
- **Theming**: every screen must support light/dark via `.dark` class toggle, glass utility classes per Doc 6.

---

## 7. Missing Backend Routes — Blockers for Full Frontend Build

Flag these to backend before building associated screens:
1. Order history / list-by-buyer endpoint.
2. Chat thread list + chat history-by-thread endpoint.
3. Product filter by `sellerId` (for seller dashboard).
4. Auction metadata (`isAuction`, `endsAt`) on Product schema + auction-close event.
5. Admin moderation/dispute resolution endpoints.
6. Admin system metrics endpoint.
7. User profile update endpoint (only read exists).
8. Seller revenue/analytics endpoint.

Build order recommendation: Auth → Catalog/Product Detail → Checkout → Seller CRUD → Chat → Bidding → Admin (admin last, most blocked).
