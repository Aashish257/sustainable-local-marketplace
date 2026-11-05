# Sustainable Local Marketplace — UI/UX Build Specification

Purpose: hand this document to an AI code-builder (or dev) to implement the full frontend UI. Every page includes layout, components, states, interactions, and accessibility notes. Grounded in existing backend (React+Vite, Socket.io, Razorpay) and existing design system (glassmorphism, Emerald/Sage palette, Outfit font, Three.js leaf canvas).

---

## 0. Design System (apply globally before building pages)

### 0.1 Colors
- Primary (Emerald): `#059669` (base), `#10b981` (bright accent)
- Ambient (Sage): `#f4f5f4` (light bg), `#3a423c` (dark ambient text)
- **New urgency accent (Amber)**: `#f59e0b` — reserved exclusively for live-bid/countdown/urgency states. Do not use elsewhere.
- Dark mode background: `#0a0f0d`; dark mode text: `#f8fafc` / `#e2e8f0`
- Light mode background: `#f8faf9`; light mode text: `text-slate-900` / `text-slate-700`

### 0.2 Typography
- Font: Google Font `Outfit`, fallback `ui-sans-serif, system-ui, -apple-system`
- Font-smoothing: antialiased
- Weight scale: body 400, UI labels 500, headings/price/score 600–700
- Scale: h1 `2.25rem`, h2 `1.5rem`, h3 `1.125rem`, body `1rem`, small `0.875rem`

### 0.3 Glass Utility Classes (already defined, reuse exactly)
Use existing `.glass`, `.glass-card`, `.glass-card-light`, `.glass-card-dark`, `.glass-green` utilities. Do not redefine — reference Doc 6 CSS blocks directly.

### 0.4 Motion Rules
- All transitions: `0.4s cubic-bezier(0.16, 1, 0.3, 1)` unless otherwise noted
- Max animation duration anywhere: 900ms (shimmer sweep only)
- Every animation must have a `prefers-reduced-motion: reduce` fallback that disables transform/animation and keeps only opacity/color transitions
- Hover lift standard: `translateY(-6px) scale(1.01)` + emerald glow shadow (reuse `.hover-card-trigger`)

### 0.5 Icons
SVG only, stroke-width 2px, round linecap/linejoin, `currentColor`. No emoji in production UI.

### 0.6 Theming
`.dark` class on root element, toggled via Navbar control, persisted to LocalStorage key `theme`, falls back to `prefers-color-scheme` on first load. 300ms ease transition on all color-dependent properties during toggle.

### 0.7 Accessibility Baseline (apply to every page below)
- Focus-visible ring: 2px solid Emerald `#10b981`, offset 2px, on every interactive element
- All icons decorative-only get `aria-hidden="true"`; functional icons get `aria-label`
- Color is never the only signal (e.g., score gauge also shows numeric label; urgency amber also has a text/timer, not color alone)
- Minimum tap target 44x44px on mobile
- Skeleton loaders (not blank/spinner-only) for any content dependent on network fetch

### 0.8 Shared Components to Build First
| Component | Used on | Notes |
|---|---|---|
| `Navbar.jsx` | all pages | role-aware links, theme toggle, cart icon (buyer), notification bell |
| `ScoreGauge.jsx` | catalog card, product detail | radial SVG gauge, 0–10, animated stroke-dashoffset on mount, numeric label center |
| `ScoreRadar.jsx` | product detail | 4-axis radar (sourcing/packaging/carbon/water), SVG polygon draw-in animation |
| `ToastNotification.jsx` | all pages | listens to socket `notification` event globally |
| `SkeletonCard.jsx` | catalog, dashboard | shimmer placeholder matching card dimensions |
| `AuctionBar.jsx` | product detail (conditional) | sticky bottom bar, amber pulse ring, countdown |
| `CartDrawer.jsx` | all pages (buyer) | slide-over panel, not separate route |

---

## 1. Home Page (`/`) — Public

### Layout
- Full-viewport hero section, Three.js canvas as background layer (z-index behind content)
- Hero content: headline (h1), subheadline, two CTAs ("Browse Catalog" primary emerald button, "Become a Seller" ghost button)
- Below hero: bento-grid of categories (glass-card-light tiles, 3–6 tiles depending on category count)
- Below bento: "How it works" 3-step strip (Discover → Chat/Bid → Checkout), each step icon + 1-line text
- Footer: standard links, dark mode respects glass-card-dark

### Three.js Leaf Canvas (reuse existing spec)
- Low-poly leaf particles, sine/cosine drift, mouse-move + scroll parallax (0.05 multiplier)
- DPR capped at `Math.min(devicePixelRatio, 2)`
- Cleanup on unmount: dispose geometries/materials, remove listeners, cancel `requestAnimationFrame`

### Interactions
- Hero CTA hover: standard hover-lift
- Bento tile click → navigates to `/products?category=X`
- Wander-blob background animation (reuse existing 22s loop spec) behind bento section only, not hero (avoid competing with 3D canvas)

### States
- No loading state needed (fully static/public)
- Reduced-motion: disable leaf drift entirely, show static leaf illustration instead

---

## 2. Auth Pages

### 2.1 Login (`/login`)
- Centered glass-card-light panel, max-width 420px, vertically centered on viewport
- Fields: email, password (with show/hide toggle icon)
- Primary button: "Log In" (full width, emerald)
- Secondary link: "Don't have an account? Register"
- Error state: inline red text below field on 401 (invalid credentials), shake micro-animation on card (150ms, respects reduced-motion)
- Loading state: button shows spinner + disabled, no page skeleton needed

### 2.2 Register (`/register`)
- Same panel style as Login
- Fields: name, email, password, role selector (segmented control: "Buyer" / "Seller" — two glass pill buttons, selected state = emerald fill)
- Password strength hint below field (static text, not a strict blocker)
- On success: auto-login (token stored), redirect to role-appropriate home (`/products` for buyer, `/dashboard` for seller)
- Validation errors (Zod 400 response): map field-by-field under each input, not a generic banner

---

## 3. Catalog Page (`/products`) — Public

### Layout
- Left sidebar (collapsible drawer on mobile): category filter (radio/checkbox list), price range (dual slider), "Clear filters" link
- Main area: responsive grid, `repeat(auto-fill, minmax(280px, 1fr))`
- Top bar above grid: result count, sort dropdown (if available), active filter chips (removable)
- Pagination: bottom-centered, simple prev/next + page numbers, glass-pill style

### Product Card Component
- glass-card-light, shimmer-on-hover, hover-lift on hover
- Top: product image (aspect-ratio 4:3, lazy-loaded)
- Top-right corner overlay: `ScoreGauge` (small variant, 40px diameter)
- Body: title (truncate 2 lines), price (bold, larger), category tag (small pill), star rating + review count (small, muted)
- Click anywhere on card → `/products/:id`

### States
- Loading: 8–12 `SkeletonCard` placeholders matching grid
- Empty (no results for filter): centered illustration + "No products match your filters" + "Clear filters" button
- Error (fetch fail): centered message + retry button

### Accessibility
- Filter sidebar collapses into a modal/drawer on mobile with a clear "Apply Filters" button, not auto-apply-on-every-click (reduces jank)

---

## 4. Product Detail Page (`/products/:id`) — Public (actions gated by auth)

### Layout (single scroll-anchored page, sticky right-column actions on desktop)
- **Left/main column**: image gallery (main image + thumbnail strip), description, `ScoreRadar` (4-axis breakdown), reviews list + review form (auth required)
- **Right column (sticky on desktop, stacks below on mobile)**: title, price, stock status, seller name/link, primary action buttons:
  - "Add to Cart" (buyer, if not auction item)
  - "Message Seller" (opens chat drawer)
  - "Join Auction" (if product is auction-type — shows current high bid inline)
- **Provenance section**: small Three.js globe (see 0.8 note — build after geo field exists on backend) with origin pin + pulsing dot, or fallback flat map-pin icon + location text if geo data unavailable
- **Conditional AuctionBar**: sticky bottom bar appears only when user has joined the auction room (see §7)

### ScoreRadar Component Detail
- 4-axis SVG polygon (sourcing, packaging, carbon, water), each axis 0–10 scale
- Animated draw-in on scroll-into-view (IntersectionObserver trigger, not on-mount if below fold)
- Hover/tap on each axis point shows tooltip with exact score + 1-line explanation text
- Fallback: if backend hasn't shipped per-criterion breakdown yet, render single `ScoreGauge` instead (component should accept both data shapes)

### Reviews Section
- List: reviewer name (or "Anonymous"), star rating, comment, relative date
- Form (auth required, buyers only): 5-star selector (tap/click), comment textarea, submit button
- On submit: optimistic append to list is unsafe (backend recalculates average) — show submitted review immediately but refetch product summary (avg rating/count) after response

### States
- Loading: skeleton for image + text blocks
- Not found (invalid id): centered 404-style message with "Back to Catalog" link

---

## 5. Cart Drawer (Global Component, not a route)

### Layout
- Slide-over panel from right edge, glass-card-dark (dark mode) / glass-card-light (light mode), width 380px desktop / full-width mobile
- Header: "Your Cart" + close icon
- List: line item per product (thumbnail, title, qty stepper, price, remove icon)
- Footer: subtotal, "Proceed to Checkout" primary button (full width), "Continue Shopping" ghost link

### Behavior
- Opens via cart icon in Navbar (badge shows item count)
- Client-side state only (Zustand) — no backend cart persistence exists, so:
  - Show a small warning banner in the drawer footer: "Cart isn't saved — complete checkout before closing this tab" (compensates for lack of backend persistence)
- Empty state: illustration + "Your cart is empty" + "Browse Catalog" button

---

## 6. Checkout Page (`/checkout`)

### Layout
- Single-column, max-width 600px, centered
- Step indicator at top (1. Review → 2. Payment → 3. Confirmation), glass-pill segmented style
- **Step 1 (Review)**: order summary (same line items as cart), editable qty, total
- **Step 2 (Payment)**: "Pay with Razorpay" button — triggers Razorpay's own modal (do not build a custom card form)
- **Step 3 (Confirmation)**: success state — checkmark animation (respects reduced-motion, falls back to static checkmark), order id, "View Order" / "Continue Shopping" buttons

### Flow Logic (matches backend sequence exactly)
1. On entering Step 2 → `POST /api/orders` → `POST /api/payments/create`
2. Open Razorpay modal with returned options
3. On Razorpay success callback → `POST /api/payments/verify`
4. On verify success → Step 3 (Confirmation)
5. On verify failure (400) → show inline error state with "Retry Payment" button, do not lose cart state

### Error States
- Payment failed/cancelled by user in Razorpay modal: return to Step 2 with a dismissible warning banner, cart preserved
- Network failure during order creation: full-page error state with retry

---

## 7. Live Auction Flow (Component overlay, triggered from Product Detail)

### AuctionBar Component
- Appears as sticky bottom bar only while user is in the auction room (socket `join_product` active)
- Contents: current highest bid (large, bold), bid input + "Place Bid" button, countdown ring (amber, pulses in final 60 seconds if `endsAt` available)
- On `new_bid` socket event: bid number does a 200ms scale-bounce, bar briefly flashes amber border
- On `bid_error` socket event: input field shows red border + inline message, does not close bar
- On leaving page/unmount: emit leave/cleanup, disconnect from room

### Accessibility
- Live bid updates announced via `aria-live="polite"` region (not visual-only) so screen reader users get bid updates

---

## 8. Buyer Account Pages

### 8.1 Order History (`/orders`)
- Note: requires backend endpoint not yet confirmed to exist — build UI assuming a `GET /api/orders/mine`-style response; coordinate with backend before wiring.
- List: order card per order (glass-card-light), shows date, status pill (pending/paid/shipped — color-coded: amber/emerald/slate), items summary, total
- Click → order detail view (line items, payment id, status timeline)

### 8.2 Chat / Messages (`/messages`)
- Two-pane layout desktop (thread list left, active conversation right); single-pane with back-navigation on mobile
- Thread list: seller/buyer name, last message preview, unread badge
- Conversation pane: message bubbles (sent = emerald-tinted right-aligned, received = neutral left-aligned), typing indicator (animated dots) below last message when active
- Input bar: text field + send button, emits `send_message` on submit
- Note: requires thread-list/history endpoints not yet confirmed on backend — flag before wiring live data, build with mock data structure matching Message schema in the meantime

---

## 9. Seller Dashboard (`/dashboard`) — Role-gated

### Layout
- Overview cards row (glass-card-light): total products, active orders, pending messages, active auctions
- Tabs or side-nav: Products | Orders | Messages | Auctions

### 9.1 Products Tab
- Table/grid of seller's own products, each row: thumbnail, title, price, stock, score, edit/delete icons
- "Add Product" button (top-right, primary emerald) → opens form (modal or `/dashboard/products/new`)

### 9.2 Product Form (Create/Edit)
- Fields: title, description (textarea), price, category (dropdown or free text), stock, sustainability score inputs (either single slider 0–10, or 4 sliders if per-criterion breakdown is live), image upload/URL inputs
- Validation: mirror backend Zod rules inline (min lengths, positive price, 0–10 score range) before submit to reduce round-trip errors
- Submit button disabled until required fields valid

### 9.3 Orders Tab
- List of orders containing seller's products, status pill, basic fulfillment note field (manual tracking per Doc 1 out-of-scope note — no logistics API integration)

### 9.4 Messages Tab
- Same chat component as buyer side, reused

### 9.5 Auctions Tab
- List of seller's auction-type products, live highest bid shown per row, link to view full AuctionBar on product page (no separate seller-side bid controls exist in backend yet — flag if "close auction" control is needed)

---

## 10. Admin Panel (`/admin`) — Role-gated, build last

### Layout
- Simple table-first layout (data-density over decoration — admin tools should be functional, not glass-heavy)
- Users tab: table of all users (name, email, role, joined date), role shown as colored pill
- Note: moderation, dispute-resolution, and metrics endpoints are not yet confirmed on backend (flagged earlier) — build these tabs as placeholder/"Coming soon" states until endpoints exist, do not fabricate data

---

## 11. Responsive Behavior Summary

| Breakpoint | Key changes |
|---|---|
| `< 640px` | Single column everywhere, filter sidebar → modal, cart drawer → full width, checkout steps stack fully, chat → single-pane with back nav |
| `640–1024px` | 2-column catalog grid, dashboard side-nav collapses to top tabs |
| `> 1024px` | Full multi-column layouts as described above, sticky right-column on Product Detail |

---

## 12. Build Order (Recommended Sequence)

1. Design system + shared components (§0)
2. Auth pages (§2)
3. Catalog + Product Card (§3)
4. Product Detail (core, without radar/globe) (§4)
5. Cart Drawer + Checkout (§5, §6)
6. ScoreGauge → AuctionBar → ScoreRadar → Provenance Globe (progressive enhancement, per earlier dependency order)
7. Seller Dashboard (§9)
8. Chat (§8.2, §9.4) — after backend thread endpoints confirmed
9. Order History (§8.1) — after backend order-list endpoint confirmed
10. Admin Panel (§10) — last, mostly placeholder until backend endpoints exist

---

## 13. Explicit Backend Gaps Affecting This Spec

Do not silently mock these as if they're real endpoints — surface a visible "pending backend" state in the UI instead:
1. Order history / list-by-buyer
2. Chat thread list + history-by-thread
3. Auction metadata (`isAuction`, `endsAt`) + close-auction event
4. Admin moderation/dispute endpoints
5. Admin metrics endpoint
6. User profile update endpoint
7. Seller revenue/analytics endpoint
8. Per-criterion sustainability breakdown field (needed for ScoreRadar; falls back to ScoreGauge until then)
9. Product geo location field (needed for Provenance Globe; falls back to flat location text until then)
