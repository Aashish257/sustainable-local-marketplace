# Sustainable Local Marketplace — Complete Frontend Rebuild Plan

**Project status:** Backend complete  
**Frontend status:** Rebuild from the ground up  
**Primary objective:** Build a complete, production-style frontend with clear user flows, complete page coverage, correct backend integration, strong UX states, responsive design, and a distinctive sustainable visual identity.

---

## 1. Purpose

The backend is already implemented across the major marketplace domains:

- Authentication and RBAC
- Products
- Cart
- Orders
- Payments
- Reviews
- Auctions / bidding
- Real-time chat
- Admin operations

Therefore, this document is the **frontend master plan**. It does not redesign or rebuild the backend.

The frontend must expose the backend functionality through coherent user journeys rather than a disconnected collection of screens.

### Core principle

```text
Backend capability
        ↓
User goal
        ↓
User journey
        ↓
Route
        ↓
Page
        ↓
Components
        ↓
API/state integration
        ↓
Loading / Empty / Error / Success / Edge states
```

A page is not considered complete merely because it renders.

---

# 2. Product Roles

The application has three primary roles:

| Role | Primary Goal |
|---|---|
| Guest | Discover the marketplace and authenticate |
| Buyer | Discover, purchase, track, review, message, and bid |
| Seller | Manage products, inventory, orders, and sales |
| Admin | Govern users, catalog, and marketplace operations |

Role authorization remains backend-controlled. Frontend route guards improve UX but are not a security boundary.

---

# 3. Frontend Architecture

Recommended structure:

```text
frontend/src/
│
├── app/
│   ├── App.jsx
│   ├── router.jsx
│   └── providers/
│       ├── AuthProvider.jsx
│       ├── ThemeProvider.jsx
│       ├── CartProvider.jsx
│       ├── NotificationProvider.jsx
│       └── SocketProvider.jsx
│
├── shared/
│   ├── components/
│   ├── layout/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── constants/
│
├── modules/
│   ├── auth/
│   ├── home/
│   ├── product/
│   ├── cart/
│   ├── order/
│   ├── payment/
│   ├── review/
│   ├── bid/
│   ├── chat/
│   ├── dashboard/
│   └── admin/
│
└── styles/
```

### Architectural rule

Feature-specific logic belongs inside its module.

Reusable UI belongs in `shared`.

---

# 4. Complete Route Map

## Public

```text
/
 /marketplace
 /products/:productId
 /about
 /how-it-works
 /login
 /register
 /404
```

## Buyer

```text
/cart
/checkout
/payment/success
/payment/failure
/orders
/orders/:orderId
/messages
/notifications
/profile
```

## Seller

```text
/dashboard
/dashboard/products
/dashboard/products/new
/dashboard/products/:productId/edit
/dashboard/products/:productId/preview
/dashboard/orders
/dashboard/orders/:orderId
/dashboard/messages
/dashboard/profile
```

## Admin

```text
/admin
/admin/users
/admin/users/:userId
/admin/products
/admin/products/:productId
/admin/orders
/admin/orders/:orderId
/admin/analytics
```

---

# 5. Route Protection

Implement:

```text
PublicRoute
ProtectedRoute
RoleRoute
```

Examples:

```text
/dashboard
→ seller only

/admin
→ admin only

/orders
→ authenticated buyer

/messages
→ authenticated users
```

Unauthorized states:

### Unauthenticated

```text
Please sign in to continue.

[Login]
```

### Forbidden

```text
You don't have permission to access this page.

[Go Back]
```

### Not found

```text
This page doesn't exist.

[Return Home]
```

---

# 6. Global Application Shell

## Navbar

### Guest

```text
Logo
Marketplace
How It Works
About
Search
Login
Join
Theme
```

### Buyer

```text
Logo
Marketplace
Search
Messages
Notifications
Cart
Profile
Theme
```

### Seller

```text
Logo
Marketplace
Seller Studio
Messages
Notifications
Profile
Theme
```

### Admin

```text
Logo
Marketplace
Admin
Notifications
Profile
Theme
```

## Footer

Include:

- Marketplace links
- About
- Sustainability mission
- Seller CTA
- Support/contact
- Community links
- Legal links

---

# 7. Global UI Components

Build these before feature pages:

```text
Button
IconButton
Input
Textarea
Select
Checkbox
Radio
SearchInput
Modal
Drawer
Dropdown
Tabs
Badge
Avatar
Toast
Tooltip
Skeleton
Spinner
EmptyState
ErrorState
ConfirmDialog
Pagination
Breadcrumb
PriceDisplay
StatusBadge
```

These components should have consistent variants and accessibility behavior.

---

# 8. Global State

Recommended conceptual state:

```text
Auth
Theme
Cart
Notifications
Socket connection
```

Example data flow:

```text
ProductPage
   ↓
useProduct(id)
   ↓
productService
   ↓
Backend API
```

Avoid duplicating API logic across individual pages.

---

# 9. Universal API State Model

Every asynchronous operation must support:

```text
IDLE
 ↓
LOADING
 ↓
SUCCESS
 ├── DATA
 └── EMPTY

ERROR
 ↓
RETRY
```

Mutation operations:

```text
IDLE
 ↓
SUBMITTING
 ↓
SUCCESS / ERROR
```

Prevent duplicate submissions.

Example:

```text
[Place Bid]
```

becomes:

```text
[Placing Bid...]
```

until the operation completes.

---

# 10. Design System

## Visual Direction

**Living Biosphere + Organic Glassmorphism**

The visual language should communicate:

- sustainability
- local craftsmanship
- trust
- natural materials
- modern technology
- spatial elegance

Avoid the previous harsh cyberpunk/terminal appearance.

## Colors

```text
Forest Night      #041c15
Deep Forest       #062e22
Living Emerald    #059669
Bright Emerald    #10b981
Sage              #f2f7f4
Sage Border       #e2ece7
Amber             #f59e0b
Amber Light       #fbbf24
```

Amber should primarily communicate:

- auctions
- countdowns
- urgency
- alerts

## Typography

```text
Outfit
→ headings / display

Inter
→ body / controls

JetBrains Mono
→ prices / timers / IDs / numerical metrics
```

## Glass

Use glass effects for visual hierarchy, not every element.

```text
Glass surface
Blur
Subtle border
Soft shadow
Emerald refraction
```

---

# 11. Theme System

Both themes are first-class:

## Dark

```text
Background: #041c15 / #062e22
Primary: emerald
Panels: dark translucent glass
Text: white / slate
```

## Light

```text
Background: #f8faf9 / white
Panels: soft sage glass
Primary: emerald
Text: dark slate
```

Theme must persist across sessions.

Respect:

```text
prefers-reduced-motion
```

---

# 12. Public Landing Page

## Route

```text
/
```

## Sections

```text
Hero
 ↓
Search / Marketplace CTA
 ↓
Categories
 ↓
Featured Products
 ↓
Sustainability Impact
 ↓
Live Auctions
 ↓
How It Works
 ↓
Seller CTA
 ↓
Footer
```

## Hero

Purpose:

Immediately explain:

1. What the marketplace is
2. Why it is different
3. What the user can do

Primary CTA:

```text
Explore Marketplace
```

Secondary:

```text
Become a Seller
```

### Optional visual enhancement

Interactive 3D leaf biosphere.

Important:

3D must never contain essential information or block core navigation.

---

# 13. How It Works Page

## Route

```text
/how-it-works
```

Explain:

```text
Discover
   ↓
Choose
   ↓
Purchase
   ↓
Track Impact
```

Separate explanations for:

- Buyers
- Sellers

---

# 14. About Page

## Route

```text
/about
```

Sections:

- Marketplace mission
- Local producers
- Sustainability principles
- Community
- Seller participation
- Buyer impact

---

# 15. Marketplace

## Route

```text
/marketplace
```

## Layout

```text
Marketplace
────────────────────────────

Search

Categories

Filters                 Products
──────────              ─────────────
Category                Card
Price                   Card
Sustainability          Card
Rating                  Card
Seller                  Card

Sort

Pagination
```

## Filters

- Category
- Price range
- Sustainability
- Rating
- Seller

## Sorting

```text
Featured
Newest
Price: Low → High
Price: High → Low
Rating
```

## Required states

### Loading

Skeleton product grid.

### Empty

```text
No products found.

Try removing some filters.

[Clear Filters]
```

### Error

```text
We couldn't load the marketplace.

[Try Again]
```

---

# 16. Product Card

Every card should expose:

```text
Image
Sustainability score
Product name
Seller
Category
Rating
Price
Stock state
Add to Cart
```

Interaction:

```text
Card click
→ Product Detail

Add to Cart
→ Update cart

Seller click
→ Seller context where supported
```

Optional:

```text
Quick Add
Wishlist only if backend supports it
```

Do not create unsupported functionality merely for visual completeness.

---

# 17. Product Detail

## Route

```text
/products/:productId
```

## Structure

```text
Breadcrumb

Image Gallery

Product Information
├── Name
├── Seller
├── Category
├── Rating
├── Price
├── Stock
└── Sustainability score

Purchase
├── Quantity
├── Add to Cart
└── Buy Now

Sustainability
├── Score
├── Radar
└── Explanation

Seller
└── Message Seller

Reviews

Related Products
```

## Product states

### Normal

```text
Add to Cart
Buy Now
```

### Out of stock

```text
Out of Stock
```

### Unavailable/deleted

```text
This product is no longer available.
```

### Loading

Full-page/product skeleton.

### Error

Retry action.

---

# 18. Sustainability UI

## ScoreGauge

Use:

```text
0–10
```

Variants:

```text
sm
md
lg
```

Display score clearly without relying on color alone.

## ScoreRadar

Four dimensions:

```text
Local Sourcing
Zero-Plastic Packaging
Carbon Footprint
Water / Soil Stewardship
```

Provide accessible text alongside the visualization.

## Impact Visualization

Optional 3D impact sphere may be used in:

- Cart
- Checkout
- Success

It is a supporting visualization, not the source of truth.

---

# 19. Auction Flow

## Entry

```text
Marketplace
 ↓
Auction Product
 ↓
Product Detail
 ↓
Auction Interface
```

## Auction interface

```text
Current Highest Bid
Countdown
Bid History
Bid Input
Quick Bid Buttons
Place Bid
Connection Status
```

## Live flow

```text
Join Auction
 ↓
Receive current bid
 ↓
Place Bid
 ↓
Backend validates
 ↓
Socket broadcasts
 ↓
UI updates
```

## Outbid

```text
You were outbid.

Current bid: ₹X

[Increase Bid]
```

## Connection failure

```text
Live connection interrupted.
Reconnecting...
```

## Auction ended

Display:

```text
Auction Ended
```

Then show the appropriate final outcome based on backend state.

---

# 20. Cart Drawer

Accessible globally.

```text
Your Cart

Product
Price
Quantity [-] 2 [+]
Remove

Subtotal

[View Cart]
[Checkout]
```

## States

```text
Loading
Empty
Populated
Stock changed
Item unavailable
API failure
```

Empty:

```text
Your cart is empty.

[Explore Marketplace]
```

---

# 21. Cart Page

## Route

```text
/cart
```

Desktop:

```text
┌─────────────────────────┬───────────────────┐
│ Cart Items              │ Order Summary     │
│                         │                   │
│ Product                 │ Subtotal          │
│ Quantity                │ Sustainability    │
│ Price                   │ Impact            │
│                         │                   │
│                         │ [Checkout]        │
└─────────────────────────┴───────────────────┘
```

Mobile:

```text
Items
 ↓
Impact
 ↓
Summary
 ↓
Checkout
```

---

# 22. Checkout

## Route

```text
/checkout
```

Three steps:

```text
01 Delivery Details
02 Payment Authorization
03 Settlement
```

Actual flow:

```text
Cart
 ↓
Checkout
 ↓
Delivery Details
 ↓
Order Review
 ↓
Create Payment Order
 ↓
Razorpay
 ↓
Backend Payment Verification
 ↓
Success / Failure
```

Frontend must never treat client-side payment completion as final order confirmation.

Backend verification is authoritative.

---

# 23. Payment Failure

## Route

```text
/payment/failure
```

Display:

```text
Payment wasn't completed.

Your cart has been preserved.

[Try Again]
[Return to Cart]
```

Handle:

- cancelled payment
- failed payment
- verification failure
- network failure
- insufficient stock
- expired checkout

---

# 24. Payment Success

## Route

```text
/payment/success
```

Display:

```text
✓ Order Confirmed

Order #XXXX

Payment Successful

₹X,XXX

Sustainability Impact
CO₂ saved
Packaging impact

[Track Order]
[Continue Shopping]
```

Optional:

```text
Settlement Certificate
3D Impact Sphere
```

---

# 25. Buyer Orders

## Route

```text
/orders
```

Filters:

```text
All
Processing
Shipped
Delivered
```

Order card:

```text
Order #12345
Items
Amount

Placed → Paid → Shipped → Delivered

[View Order]
```

---

# 26. Buyer Order Detail

## Route

```text
/orders/:orderId
```

Sections:

```text
Order Header

Status Timeline
Placed
Paid
Shipped
Delivered

Items

Delivery

Payment

Sustainability Impact

Reviews
```

---

# 27. Review Flow

```text
Delivered Order
 ↓
Order Detail
 ↓
Review Product
 ↓
Rating + Comment
 ↓
Submit
 ↓
Refresh Review State
```

States:

```text
Not eligible
Already reviewed
Form open
Submitting
Success
Error
```

---

# 28. Messaging

## Route

```text
/messages
```

Desktop:

```text
┌────────────────┬────────────────────────┐
│ Conversations  │ Active Chat            │
│                │                         │
│ Seller A       │ Messages               │
│ Seller B       │                         │
│                │ Typing...              │
│                │                         │
│                │ Message input [Send]   │
└────────────────┴────────────────────────┘
```

Mobile:

```text
Conversation List
 ↓
Chat
```

Required functionality:

- Conversation list
- Message history
- Send message
- Typing indicator
- Read state where supported
- Unread count
- Socket connection state
- Reconnection
- Failed message state

---

# 29. Notifications

## Route

```text
/notifications
```

Examples:

```text
You were outbid.

Your order has shipped.

Your product was approved.

New message received.
```

Clicking a notification should navigate to the relevant resource.

---

# 30. Profile

## Route

```text
/profile
```

Common:

```text
Profile
Name
Email
Role
Account Settings
Logout
```

Role-specific links should appear according to permissions.

---

# 31. Seller Dashboard

## Route

```text
/dashboard
```

Dashboard:

```text
Seller Studio

Revenue
Orders
Products
Average Sustainability Score

Sales Analytics

Recent Orders

Quick Actions
[Add Product]
[Manage Products]
[View Orders]
```

Charts should be useful rather than decorative.

---

# 32. Seller Products

## Route

```text
/dashboard/products
```

Table:

```text
Product
Stock
Price
Sustainability
Status
Actions
```

Actions:

```text
Edit
Delete
Manage Stock
Preview
```

Empty state:

```text
You haven't created any products yet.

[Add Product]
```

---

# 33. Add Product

## Route

```text
/dashboard/products/new
```

Sections:

### Basic Information

- Name
- Description
- Category

### Commercial

- Price
- Stock

### Images

- Product images

### Sustainability

- Local sourcing
- Packaging
- Carbon footprint
- Water/soil stewardship

### Actions

```text
[Cancel]
[Create Product]
```

Validation must happen before submission and backend errors must be surfaced clearly.

---

# 34. Edit Product

## Route

```text
/dashboard/products/:productId/edit
```

Flow:

```text
Load Product
 ↓
Populate Form
 ↓
Edit
 ↓
Validate
 ↓
Save
 ↓
Success
 ↓
Product Management
```

Handle missing/deleted products.

---

# 35. Seller Orders

## Route

```text
/dashboard/orders
```

Columns:

```text
Order ID
Buyer
Items
Amount
Status
Date
Action
```

Order detail:

```text
Order Information
Buyer
Items
Payment
Delivery
Current Status

[Update Status]
```

Only expose status values/actions supported by the backend.

---

# 36. Seller Analytics

Dashboard analytics should communicate:

- Revenue
- Order volume
- Product performance
- Time-based trends
- Sustainability performance where backend data supports it

Avoid inventing metrics that do not exist in backend data.

---

# 37. Admin Dashboard

## Route

```text
/admin
```

Display:

```text
Total Users
Active Orders
Platform Volume
Catalog Size

Platform Activity

Moderation Queue

Recent Users

Recent Orders
```

---

# 38. Admin Users

## Route

```text
/admin/users
```

Table:

```text
User
Email
Role
Status
Joined
Actions
```

User detail:

```text
User Information
Current Role
Activity
Orders
Products

[Change Role]
```

Role changes require confirmation.

Example:

```text
Change role to Admin?

This grants administrative access.

[Cancel] [Confirm]
```

---

# 39. Admin Product Moderation

## Route

```text
/admin/products
```

Tabs:

```text
Pending
Approved
Rejected
```

Product review:

```text
Product Preview
Seller
Sustainability Information
Moderation Decision

[Approve]
[Reject]
```

Include:

```text
Loading
No pending products
Action success
Action failure
```

---

# 40. Admin Orders

## Route

```text
/admin/orders
/admin/orders/:orderId
```

Display:

```text
Order
Buyer
Seller
Items
Payment
Status
Timeline
```

Admin may perform backend-supported status overrides.

---

# 41. Admin Analytics

Only show metrics available from backend data.

Potential categories:

```text
Users
Products
Orders
Revenue / Volume
Marketplace activity
```

Do not fabricate analytics just to fill dashboard space.

---

# 42. 404 and System Error Pages

## 404

```text
Page not found.

[Go Home]
```

## Server error

```text
Something went wrong.

[Try Again]
```

## Network offline

```text
You're offline.

We'll retry when the connection returns.
```

---

# 43. Confirmation Patterns

Use confirmation dialogs for destructive or privileged actions.

## Delete product

```text
Delete Product?

This action cannot be undone.

[Cancel] [Delete]
```

## Role change

```text
Change User Role?

This changes the user's permissions.

[Cancel] [Confirm]
```

---

# 44. Toast System

Success:

```text
✓ Added to cart
✓ Product created
✓ Order placed
✓ Review submitted
✓ Bid placed
✓ Message sent
```

Error:

```text
Couldn't add item to cart.
Payment failed.
Couldn't update order.
```

Critical information must also appear in the page UI; do not rely only on transient toasts.

---

# 45. Responsive Design

Support:

```text
Mobile
Tablet
Desktop
```

## Mobile rules

Navbar becomes compact.

Tables become cards.

Two-column layouts become stacked.

Chat becomes:

```text
Conversations
 ↓
Chat
```

Auction controls remain accessible without covering essential content.

---

# 46. Accessibility

Minimum requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Form labels
- Accessible buttons
- Appropriate ARIA labels
- Sufficient contrast
- Reduced motion support
- Screen-reader-friendly status updates
- No essential interaction dependent only on hover

---

# 47. Performance

Priorities:

- Lazy-load large routes
- Lazy-load Three.js scenes
- Optimize product images
- Avoid unnecessary global rerenders
- Debounce marketplace search
- Paginate large lists
- Clean up WebSocket subscriptions
- Dispose Three.js resources
- Limit device pixel ratio
- Avoid animation overload

3D should degrade gracefully on low-powered devices.

---

# 48. Security UX

Frontend should:

- Never expose secrets
- Never assume frontend role checks are authorization
- Never trust client payment success
- Avoid displaying sensitive backend errors
- Clear authenticated state when session expires
- Prevent duplicate mutations
- Validate user input before submission

Backend remains the source of truth for authorization and payment verification.

---

# 49. Complete Buyer Journey

## Standard purchase

```text
Landing
 ↓
Marketplace
 ↓
Search / Filter
 ↓
Product Detail
 ↓
Add to Cart
 ↓
Cart Drawer
 ↓
Cart
 ↓
Checkout
 ↓
Delivery Details
 ↓
Payment
 ↓
Razorpay
 ↓
Backend Verification
 ↓
Success
 ↓
Order Detail
 ↓
Shipment
 ↓
Delivery
 ↓
Review
```

## Buy Now

```text
Product
 ↓
Buy Now
 ↓
Checkout
```

---

# 50. Complete Auction Journey

```text
Marketplace
 ↓
Auction Product
 ↓
Product Detail
 ↓
Auction Interface
 ↓
Join
 ↓
Live Bids
 ↓
Place Bid
 ↓
Outbid / Highest Bid
 ↓
Auction Ends
 ↓
Final Outcome
 ↓
Settlement / Order where applicable
```

---

# 51. Complete Seller Journey

```text
Login
 ↓
Seller Dashboard
 ↓
Add Product
 ↓
Sustainability Information
 ↓
Create
 ↓
Product Management
 ↓
Published Product
 ↓
Buyer Purchase
 ↓
Seller Orders
 ↓
Order Detail
 ↓
Update Status
 ↓
Shipped
 ↓
Delivered
```

---

# 52. Complete Admin Journey

```text
Login
 ↓
Admin Dashboard
 ├── Users
 │    ↓
 │   User Detail
 │    ↓
 │   Role Management
 │
 ├── Products
 │    ↓
 │   Moderation
 │    ↓
 │   Approve / Reject
 │
 └── Orders
      ↓
     Order Detail
      ↓
     Status Override
```

---

# 53. Critical Edge Cases

## Authentication

- Invalid credentials
- Session expiration
- Unauthorized route
- Forbidden route
- Logout
- Authentication loading

## Marketplace

- Empty catalog
- No search results
- API failure
- Pagination boundary

## Product

- Missing product
- Out of stock
- Image failure
- Product removed

## Cart

- Empty cart
- Stock changed
- Item unavailable
- Price changed
- Failed cart update

## Checkout

- Invalid delivery data
- Payment cancelled
- Payment failed
- Verification failed
- Stock unavailable
- Network failure

## Auction

- Auction not started
- Auction active
- User outbid
- Socket disconnected
- Auction ended
- Winner
- Loser

## Chat

- Empty conversations
- Sending
- Failed message
- Socket disconnected
- Reconnecting
- Typing indicator

## Seller

- No products
- No orders
- Create failure
- Update failure
- Delete confirmation

## Admin

- No moderation queue
- Role update failure
- Moderation failure
- Unauthorized access

---

# 54. Frontend Build Order

Do not begin with visual effects.

## Phase 1 — Foundation

- [ ] App architecture
- [ ] Router
- [ ] API client
- [ ] Auth state
- [ ] Route guards
- [ ] Theme system
- [ ] Error handling
- [ ] Loading system

## Phase 2 — Shared UI

- [ ] Buttons
- [ ] Inputs
- [ ] Cards
- [ ] Modal
- [ ] Drawer
- [ ] Toast
- [ ] Skeleton
- [ ] Empty state
- [ ] Error state
- [ ] Tables
- [ ] Pagination

## Phase 3 — Global Shell

- [ ] Navbar
- [ ] Footer
- [ ] Mobile navigation
- [ ] Role navigation
- [ ] Cart badge
- [ ] Notifications

## Phase 4 — Public Marketplace

- [ ] Landing
- [ ] Marketplace
- [ ] Product Card
- [ ] Product Detail
- [ ] About
- [ ] How It Works
- [ ] 404

## Phase 5 — Purchase

- [ ] Cart Drawer
- [ ] Cart
- [ ] Checkout
- [ ] Payment
- [ ] Success
- [ ] Failure

## Phase 6 — Buyer Account

- [ ] Orders
- [ ] Order Detail
- [ ] Reviews
- [Messages
- [ ] Notifications
- [ ] Profile

## Phase 7 — Real-Time

- [ ] Socket infrastructure
- [ ] Auction
- [ ] Live bid updates
- [ ] Chat
- [ ] Typing indicator
- [ ] Reconnection

## Phase 8 — Seller

- [ ] Seller Dashboard
- [ ] Products
- [ ] Add Product
- [ ] Edit Product
- [ ] Preview
- [ ] Inventory
- [ ] Orders
- [ ] Order Detail
- [ ] Analytics

## Phase 9 — Admin

- [ ] Admin Dashboard
- [ ] Users
- [ ] User Detail
- [ ] Products
- [ ] Moderation
- [ ] Orders
- [ ] Order Detail
- [ ] Analytics

## Phase 10 — Visual Excellence

- [ ] ThreeLeafScene
- [ ] Impact Sphere
- [ ] ScoreGauge
- [ ] ScoreRadar
- [ ] AuctionBar
- [ ] Glass effects
- [ ] Micro-interactions
- [ ] Page transitions

---

# 55. Testing Strategy

## Build

```powershell
cd frontend
npm run build
```

Must complete with:

```text
Exit code 0
0 compilation errors
```

## Functional testing

Test:

```text
Authentication
Product browsing
Filtering
Cart
Checkout
Payment
Orders
Reviews
Auction
Chat
Seller CRUD
Seller fulfillment
Admin operations
```

## Visual testing

Verify:

```text
Dark mode
Light mode
Mobile
Tablet
Desktop
Loading
Empty
Error
Success
```

## Real-time testing

Verify:

```text
Bid broadcast
Bid ordering
Outbid notification
Auction completion
Chat messages
Typing indicator
Socket reconnect
```

---

# 56. End-to-End Acceptance Checklist

## Guest

- [ ] Landing loads
- [ ] Marketplace accessible
- [ ] Search works
- [ ] Product detail works
- [ ] Login works
- [ ] Registration works

## Buyer

- [ ] Login
- [ ] Browse
- [ ] Search
- [ ] Filter
- [ ] Add cart
- [ ] Modify quantity
- [ ] Remove item
- [ ] Checkout
- [ ] Payment
- [ ] Success
- [ ] Failure handling
- [ ] Orders
- [ ] Order detail
- [ ] Reviews
- [ ] Messages
- [ ] Notifications
- [ ] Profile

## Seller

- [ ] Login
- [ ] Dashboard
- [ ] Create product
- [ ] Edit product
- [ ] Delete product
- [ ] Inventory
- [ ] Orders
- [ ] Order detail
- [ ] Update order status
- [ ] Analytics

## Admin

- [ ] Login
- [ ] Dashboard
- [ ] Users
- [ ] User detail
- [ ] Role management
- [ ] Product moderation
- [ ] Orders
- [ ] Order detail
- [ ] Status management
- [ ] Analytics

## Quality

- [ ] Responsive
- [ ] Accessible
- [ ] Dark mode
- [ ] Light mode
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Success states
- [ ] 404
- [ ] Session expiry
- [ ] Network failure
- [ ] No console errors
- [ ] Production build succeeds

---

# 57. Definition of Done

A feature is complete only when all of the following are true:

```text
[ ] Route exists
[ ] Navigation exists
[ ] UI exists
[ ] Backend API integrated
[ ] Correct state management
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Success state
[ ] Validation
[ ] Authorization behavior
[ ] Responsive layout
[ ] Accessibility
[ ] Edge cases handled
[ ] No duplicate requests
[ ] No console errors
[ ] Tested end-to-end
```

---

# 58. Most Important Implementation Rule

Do not build the frontend as:

```text
Beautiful Page
      ↓
Beautiful Page
      ↓
Beautiful Page
```

Build it as:

```text
Backend Capability
       ↓
User Goal
       ↓
User Flow
       ↓
Route
       ↓
Page
       ↓
Components
       ↓
API
       ↓
State
       ↓
Edge Cases
       ↓
Visual Design
```

The visual system is the final layer, not the foundation.

This ensures that the finished marketplace feels like a **single complete product**, not a set of disconnected UI demonstrations.

---

# 59. Final Frontend Objective

The finished application should allow a new user to understand the product within seconds:

```text
What is this?
    ↓
A sustainable local marketplace.

What can I do?
    ↓
Discover sustainable products.
Buy them.
Bid on selected products.
Talk to sellers.
Track orders.
See sustainability impact.

What if I'm a seller?
    ↓
Create products.
Manage inventory.
Receive orders.
Fulfill orders.
Track performance.

What if I'm an admin?
    ↓
Manage users.
Moderate products.
Manage marketplace operations.
```

The final frontend should therefore optimize for:

**Clarity → Flow → Functionality → Trust → Performance → Visual differentiation**

rather than visual complexity alone.


---

# 60. Detailed Design Specification

This section is the **visual and interaction design contract** for the frontend. It defines how the application should look and behave consistently across every page.

The design must support the product's sustainability identity without sacrificing usability, readability, accessibility, or performance.

---

## 60.1 Design Direction

### Design concept

**Living Biosphere + Organic Glassmorphism**

The interface should feel like a modern digital marketplace embedded inside a calm, living natural environment.

Visual characteristics:

- Deep forest surfaces
- Soft sage light surfaces
- Emerald accents
- Frosted translucent panels
- Organic rounded geometry
- Natural gradients
- Subtle ambient lighting
- Soft depth
- Spacious layouts
- High-quality product imagery
- Restrained motion
- Clear typography

### Avoid

Do not use:

- Cyberpunk UI
- Terminal-like interfaces
- Excessive neon
- Pure black everywhere
- Excessive amber
- Overly aggressive glow
- Excessive glass blur
- Decorative animation that interferes with tasks
- Dense dashboard layouts without hierarchy

---

# 60.2 Design Principles

## 1. Clarity first

Every screen must immediately communicate:

```text
Where am I?
What can I do?
What is the primary action?
What happened?
What should I do next?
```

## 2. Natural hierarchy

Use:

```text
Typography
→ spacing
→ grouping
→ elevation
→ color
→ animation
```

rather than using color and glow for everything.

## 3. One primary action

Each important screen should have one visually dominant CTA.

Examples:

```text
Product Detail
→ Add to Cart / Buy Now

Checkout
→ Continue / Pay

Seller Product
→ Create Product

Admin Moderation
→ Approve / Reject
```

## 4. Progressive disclosure

Do not expose every piece of information simultaneously.

Show:

```text
Essential information
        ↓
Useful supporting information
        ↓
Detailed information
```

---

# 60.3 Color System

Define semantic design tokens rather than hard-coding colors throughout components.

```css
:root {
  --color-forest-950: #041c15;
  --color-forest-900: #062e22;

  --color-emerald-600: #059669;
  --color-emerald-500: #10b981;

  --color-sage-50: #f2f7f4;
  --color-sage-100: #e2ece7;

  --color-amber-500: #f59e0b;
  --color-amber-400: #fbbf24;

  --color-white: #ffffff;

  --color-slate-900: #0f172a;
  --color-slate-600: #475569;
  --color-slate-400: #94a3b8;
}
```

### Semantic tokens

```text
--bg-primary
--bg-secondary
--bg-elevated

--text-primary
--text-secondary
--text-muted

--border-default
--border-subtle

--brand-primary
--brand-primary-hover

--success
--warning
--error
--info

--auction
```

Do not use raw hex values inside feature components when a semantic token exists.

---

# 60.4 Color Semantics

| Color | Meaning |
|---|---|
| Emerald | Primary brand / positive / sustainable |
| Deep forest | Main dark background |
| Sage | Light surfaces |
| Amber | Auction / urgency / countdown |
| Red | Destructive / failure |
| Blue | Informational only |
| Neutral | Secondary information |

Amber must not become the default CTA color.

---

# 60.5 Dark Theme

Primary environment:

```text
Background
#041c15

Secondary background
#062e22

Primary accent
#10b981

Secondary accent
#059669

Primary text
#ffffff

Secondary text
#94a3b8
```

### Dark UI hierarchy

```text
Background
 ↓
Section surface
 ↓
Glass card
 ↓
Elevated card
 ↓
Modal / drawer
```

Avoid pure white surfaces in dark mode.

---

# 60.6 Light Theme

Primary environment:

```text
Background
#f8faf9

Cards
#ffffff

Secondary surface
#f2f7f4

Borders
#e2ece7

Primary text
#0f172a

Secondary text
#475569

Brand
#059669
```

The light theme should feel warm, clean, and organic rather than sterile.

---

# 60.7 Typography System

Use:

```text
Outfit
→ display and headings

Inter
→ body, labels, controls

JetBrains Mono
→ prices, order IDs, timers, numerical telemetry
```

### Scale

```text
Display
48–72px

H1
40–48px

H2
32–40px

H3
24–30px

H4
20–24px

Body Large
18px

Body
16px

Body Small
14px

Caption
12px
```

Use responsive scaling rather than fixed desktop sizes everywhere.

### Typography rules

Headings:

- 600–800 weight
- Tight line height
- Strong hierarchy

Body:

- 400–500 weight
- Comfortable line height

Controls:

- 500–600 weight

Metrics:

- JetBrains Mono
- Strong numerical contrast

---

# 60.8 Spacing System

Use a consistent spacing scale.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
96px
128px
```

Prefer spacing tokens over arbitrary values.

Example:

```text
Card padding
24px

Section spacing
64–96px

Grid gap
20–24px

Form field gap
16px
```

---

# 60.9 Layout Grid

Desktop:

```text
Max content width
1200–1400px

Side padding
32–48px
```

Tablet:

```text
Side padding
24px
```

Mobile:

```text
Side padding
16px
```

Use CSS Grid/Flexbox rather than fixed-position layouts.

---

# 60.10 Border Radius

Recommended hierarchy:

```text
Small control
8px

Buttons
10–12px

Cards
16–20px

Large feature cards
24px

Hero panels
28–32px

Pills
999px
```

Avoid using one radius for every element.

---

# 60.11 Glassmorphism Specification

Use glass selectively.

### Standard glass

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Dark glass card

```css
.glass-card {
  background: rgba(6, 46, 34, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  box-shadow: 0 8px 32px rgba(4, 28, 21, 0.37);
}
```

### Light glass

Use:

```text
white translucent surface
soft sage border
subtle shadow
moderate blur
```

Do not use excessive transparency behind text.

---

# 60.12 Surface Hierarchy

Use approximately four visual levels:

```text
Level 0
Page background

Level 1
Section surface

Level 2
Card / glass panel

Level 3
Elevated interactive element

Level 4
Modal / drawer / popover
```

Every level should have a meaningful purpose.

---

# 60.13 Shadows

Shadows should be soft and atmospheric.

Use stronger elevation only for:

- drawers
- modals
- dropdowns
- floating auction controls

Avoid heavy shadows on every card.

---

# 60.14 Buttons

## Primary

```text
Emerald background
White text
Strong contrast
```

Use for the main action.

## Secondary

```text
Transparent / glass
Emerald or primary text
Subtle border
```

## Ghost

Minimal visual weight.

## Destructive

Reserved for:

```text
Delete
Reject
Remove
```

## Loading

Button must preserve dimensions:

```text
[Spinner] Creating...
```

Never cause layout shift during loading.

---

# 60.15 Inputs

Every input must have:

```text
Label
Input
Optional helper
Validation state
Error message
```

States:

```text
Default
Hover
Focus
Filled
Disabled
Error
Success
```

Never communicate validation only through color.

---

# 60.16 Cards

Cards should have:

```text
Clear hierarchy
Consistent padding
Readable title
Supporting metadata
Primary action
Subtle interaction
```

Product cards can use hover lift and shimmer.

Dashboard cards should prioritize data readability over decoration.

---

# 60.17 Product Image Guidelines

Product images should:

- use consistent aspect ratios
- preserve natural proportions
- avoid unnecessary cropping
- lazy-load where appropriate
- show fallback state when unavailable
- support gallery navigation on detail pages

Preferred product card ratio:

```text
4:3 or 1:1
```

Product detail gallery:

```text
4:3 / 3:2
```

---

# 60.18 Product Card Interaction

Default:

```text
Static
```

Hover:

```text
translateY(-4px)
subtle shadow increase
soft border highlight
```

Do not overanimate.

Quick-add feedback:

```text
Add to Cart
 ↓
Adding...
 ↓
✓ Added
```

---

# 60.19 Navigation Design

Desktop:

```text
Logo | Primary navigation | Search | Actions | Profile
```

Mobile:

```text
Logo | Cart | Menu
```

Navigation must clearly distinguish:

```text
Marketplace
Buyer account
Seller Studio
Admin
```

Role-specific navigation should never be visually confusing.

---

# 60.20 Sidebar Design

Seller/Admin sidebars:

```text
Dashboard
Products
Orders
Analytics
Messages
Settings
```

Use:

- active indicator
- icon
- label
- tooltip only when collapsed

Mobile sidebar becomes a drawer.

---

# 60.21 Dashboard Design

Dashboards should follow:

```text
Page title
 ↓
Summary metrics
 ↓
Primary chart / activity
 ↓
Recent activity
 ↓
Quick actions
```

Do not create dashboards that are only collections of cards.

Every chart should answer a business question.

---

# 60.22 Marketplace Grid

Desktop:

```text
4 columns
```

Large desktop:

```text
4–5 columns depending on available width
```

Tablet:

```text
2–3 columns
```

Mobile:

```text
1–2 columns
```

Filters:

Desktop:

```text
Persistent / collapsible sidebar
```

Mobile:

```text
Filter drawer
```

---

# 60.23 Product Detail Layout

Desktop:

```text
┌───────────────────────┬─────────────────────────┐
│                       │ Product Information     │
│ Image Gallery         │ Price                   │
│                       │ Rating                  │
│                       │ Stock                   │
│                       │                         │
│                       │ Purchase Actions        │
└───────────────────────┴─────────────────────────┘

Sustainability
──────────────────────────────────────────────

Seller
──────────────────────────────────────────────

Reviews
──────────────────────────────────────────────

Related Products
```

Mobile:

```text
Gallery
 ↓
Product information
 ↓
Price
 ↓
Purchase actions
 ↓
Sustainability
 ↓
Seller
 ↓
Reviews
 ↓
Related products
```

---

# 60.24 Sticky Actions

Use sticky actions only where they improve conversion.

Product:

```text
Desktop
→ sticky purchase summary where appropriate

Mobile
→ bottom purchase action
```

Auction:

```text
Sticky auction dock
```

Checkout:

```text
Sticky order summary on desktop
```

Avoid multiple competing sticky elements.

---

# 60.25 Auction Visual Language

Auction is the one place where amber becomes prominent.

Use:

```text
Amber countdown
Amber pulse
Emerald primary action
Dark/neutral auction surface
```

Example:

```text
LIVE AUCTION

02:14:38

Current Bid
₹2,450

[−] ₹2,500 [+]
[Place Bid]
```

The countdown must remain readable without animation.

---

# 60.26 Chat Design

Message alignment:

```text
Other user
← left

Current user
→ right
```

Message bubble:

```text
Message
Timestamp
Read state where supported
```

Typing:

```text
Seller is typing...
```

Connection:

```text
Connected
Reconnecting...
Offline
```

Connection state should never be hidden when it affects message delivery.

---

# 60.27 Cart Design

Cart should emphasize:

```text
Product
Quantity
Price
Subtotal
Checkout
```

Sustainability impact should support—not compete with—the purchase summary.

Use:

```text
Primary purchase information
        ↓
Impact information
```

---

# 60.28 Checkout Design

Use a clear progress indicator:

```text
01 Delivery
───────
02 Payment
───────
03 Confirmation
```

Current step should be visually dominant.

Completed steps:

```text
✓
```

Future steps:

```text
○
```

Never hide critical order information behind decorative animations.

---

# 60.29 Success Page Design

Success should feel celebratory but trustworthy.

Hierarchy:

```text
Success
 ↓
Order ID
 ↓
Amount
 ↓
Payment confirmation
 ↓
Impact
 ↓
Next action
```

Primary:

```text
Track Order
```

Secondary:

```text
Continue Shopping
```

Optional 3D impact visualization may be used as a supporting visual.

---

# 60.30 Order Timeline

Use a vertical timeline on mobile and a horizontal timeline on wider screens when space permits.

```text
✓ Placed
   │
✓ Paid
   │
✓ Shipped
   │
○ Delivered
```

Each state should have:

- label
- date/time when available
- concise explanation

---

# 60.31 Empty State Design

Every empty state should answer:

```text
What is empty?
Why is it empty?
What can I do?
```

Example:

```text
Your cart is empty.

Explore sustainable products from local producers.

[Explore Marketplace]
```

Avoid meaningless:

```text
No data.
```

---

# 60.32 Error State Design

Use:

```text
Clear headline
Short explanation
Recovery action
```

Example:

```text
We couldn't load your orders.

Please try again.

[Try Again]
```

Never expose:

```text
500 Internal Server Error
AxiosError
MongoError
```

to normal users.

---

# 60.33 Skeleton Loading

Skeletons should resemble the final layout.

Product:

```text
Image skeleton
Title skeleton
Metadata skeleton
Price skeleton
Button skeleton
```

Avoid full-screen spinners when content structure can be displayed immediately.

---

# 60.34 Modal Design

Modal hierarchy:

```text
Overlay
 ↓
Modal
 ├── Title
 ├── Description
 ├── Content
 └── Actions
```

Rules:

- trap keyboard focus
- close with Escape where appropriate
- provide clear close control
- prevent accidental destructive actions

---

# 60.35 Drawer Design

Use drawers for:

- Cart
- Filters on mobile
- Navigation on mobile
- Secondary details

Drawer must:

- lock background interaction where appropriate
- support Escape
- have clear heading
- remain scrollable
- work on small screens

---

# 60.36 Toast Design

Toasts are for lightweight feedback.

Good:

```text
✓ Product added to cart
```

Bad:

```text
Payment failed — try again
```

if that is the only indication of a critical payment failure.

Critical states belong on the page.

---

# 60.37 Iconography

Use one consistent icon family.

Preferred style:

```text
Soft rounded / outline icons
```

Icons should:

- have consistent stroke weight
- not replace important labels
- include accessible labels where needed
- support semantic meaning

Avoid mixing unrelated icon styles.

---

# 60.38 Motion System

Motion should communicate:

```text
State change
Hierarchy
Direction
Feedback
```

Recommended durations:

```text
Fast
120–180ms

Normal
200–300ms

Slow
400–700ms
```

Use easing such as:

```text
ease-out
cubic-bezier(0.16, 1, 0.3, 1)
```

Avoid perpetual animation except where it communicates live status.

---

# 60.39 Page Transitions

Keep transitions subtle:

```text
opacity
translateY
small scale
```

Do not make users wait for transitions.

Navigation should feel instant.

---

# 60.40 3D/WebGL Design Rules

Three.js scenes may be used for:

```text
Landing hero
Impact visualization
Selected promotional experiences
```

Requirements:

- lazy-load
- dispose resources on unmount
- cap device pixel ratio
- avoid blocking main interactions
- provide reduced-motion behavior
- provide fallback visual for unsupported/slow devices
- never put critical information only inside WebGL

---

# 60.41 Sustainability Visualization Rules

Sustainability data must remain understandable without graphics.

For example:

```text
Sustainability Score
9.2 / 10

Local sourcing
8.8 / 10

Low carbon footprint
9.4 / 10
```

The radar chart is supplementary.

---

# 60.42 Accessibility Design Rules

Every interactive element must support keyboard navigation.

Required:

```text
Focus-visible
Keyboard navigation
Semantic labels
Accessible error messages
Accessible dialogs
Accessible status updates
Reduced motion
```

Color cannot be the only indicator.

Bad:

```text
Green = success
Red = error
```

Good:

```text
✓ Success
✕ Error
```

plus semantic color.

---

# 60.43 Responsive Interaction Rules

Do not simply shrink desktop UI.

Mobile should have intentional interaction patterns.

Examples:

```text
Desktop filter sidebar
→ Mobile filter drawer

Desktop two-pane chat
→ Mobile conversation → chat navigation

Desktop table
→ Mobile order/product cards

Desktop multi-column checkout
→ Mobile stacked flow
```

---

# 60.44 Design Consistency Rules

The same concept must look the same everywhere.

Examples:

```text
Primary CTA
→ same button system

Price
→ same currency typography

Order status
→ same StatusBadge

Sustainability score
→ same ScoreGauge

Errors
→ same ErrorState

Empty screens
→ same EmptyState
```

Do not create page-specific visual variants unless there is a strong UX reason.

---

# 60.45 Component Variants

Components should expose controlled variants.

Example:

```text
Button
├── primary
├── secondary
├── ghost
└── destructive

Card
├── default
├── glass
├── elevated
└── interactive

Badge
├── success
├── warning
├── error
├── info
└── neutral
```

Avoid dozens of one-off variants.

---

# 60.46 Design Tokens for Implementation

Create a centralized token layer:

```text
colors
typography
spacing
radius
shadows
z-index
motion
breakpoints
```

Example:

```css
--radius-sm
--radius-md
--radius-lg
--radius-xl

--shadow-sm
--shadow-md
--shadow-lg

--z-dropdown
--z-sticky
--z-modal
--z-toast
```

---

# 60.47 Z-Index Architecture

Use a defined hierarchy:

```text
Base
10

Sticky
100

Header
200

Dropdown
300

Drawer
400

Modal
500

Toast
600
```

Avoid arbitrary values such as:

```text
z-index: 999999;
```

---

# 60.48 Forms Design

Long forms must be grouped.

Example seller product form:

```text
Basic Information
        ↓
Commercial Details
        ↓
Images
        ↓
Sustainability
        ↓
Preview
        ↓
Submit
```

Validation should be:

- immediate for obvious local errors
- clear on submit
- positioned near the affected field
- summarized when many errors exist

---

# 60.49 Tables

Desktop tables should support:

- readable headers
- alignment by data type
- row hover
- actions
- pagination
- empty state

Mobile should transform into cards rather than forcing horizontal scrolling when possible.

---

# 60.50 Admin Visual Language

Admin should share the brand but have a more operational visual hierarchy.

Use:

```text
Dark forest / neutral surfaces
Emerald status
Clear data tables
Compact but readable controls
Moderate charts
Minimal decorative 3D
```

The admin portal should prioritize accuracy and speed over marketing aesthetics.

---

# 60.51 Seller Visual Language

Seller Studio should feel like a professional workspace.

Priorities:

```text
Revenue
Orders
Products
Inventory
Performance
Actions
```

Use the same brand system but reduce decorative elements.

---

# 60.52 Buyer Visual Language

Buyer-facing pages should be:

```text
Visual
Warm
Trustworthy
Product-focused
Discovery-oriented
```

This is where product imagery, sustainability storytelling, and the organic glass aesthetic can be strongest.

---

# 60.53 Trust Design

Marketplace trust should be visible.

Where backend data supports it, show:

```text
Verified seller
Verified buyer review
Sustainability score
Stock status
Payment status
Order status
```

Never invent verification claims that the backend does not provide.

---

# 60.54 Micro-interactions

Use subtle feedback for:

```text
Add to cart
Quantity change
Remove item
Filter selection
Form submission
Bid placement
Message sending
Status updates
Theme switching
```

Example:

```text
Add to Cart
→ button compresses slightly
→ success state
→ cart badge increments
```

---

# 60.55 Design QA Checklist

Before approving a page:

### Visual

```text
[ ] Correct theme
[ ] Correct spacing
[ ] Typography consistent
[ ] No accidental colors
[ ] Correct card hierarchy
[ ] Correct button hierarchy
[ ] Images aligned
```

### Interaction

```text
[ ] Hover
[ ] Focus
[ ] Active
[ ] Disabled
[ ] Loading
[ ] Success
[ ] Error
```

### Responsive

```text
[ ] Mobile
[ ] Tablet
[ ] Desktop
```

### Accessibility

```text
[ ] Keyboard
[ ] Focus
[ ] Labels
[ ] Contrast
[ ] Reduced motion
```

---

# 60.56 Final Design Quality Bar

The frontend should feel:

**Natural, premium, trustworthy, modern, and purposeful.**

It should not feel:

**Over-designed, game-like, cyberpunk, cluttered, or decorative for decoration's sake.**

The visual system exists to strengthen the marketplace's core experience:

```text
Discover
   ↓
Understand
   ↓
Trust
   ↓
Purchase
   ↓
Track
   ↓
Engage
```

---

# 61. Frontend Design-to-Function Rule

Every major visual element must have a reason.

| Visual | Functional purpose |
|---|---|
| Sustainability Gauge | Quickly communicate sustainability score |
| Radar | Explain score composition |
| Amber auction UI | Communicate urgency/live state |
| Glass card | Establish grouping and hierarchy |
| 3D leaf scene | Brand atmosphere |
| Impact sphere | Visualize sustainability impact |
| Timeline | Explain order progress |
| Badge | Communicate status |
| Toast | Confirm lightweight actions |
| Skeleton | Communicate loading structure |

If an effect does not improve understanding, feedback, hierarchy, or brand identity, remove it.

---

# 62. Final Design System Goal

The entire application must look like one product.

```text
Landing
    ↓
Marketplace
    ↓
Product
    ↓
Cart
    ↓
Checkout
    ↓
Orders
    ↓
Messages

Seller Studio
    ↓
Admin Portal
```

All of these should share:

```text
Same typography
Same color semantics
Same spacing
Same controls
Same states
Same interaction language
Same accessibility standards
```

Only the **density and purpose** should change between Buyer, Seller, and Admin experiences.
