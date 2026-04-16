# 🌱 Sustainable Local Marketplace — Backend
 
> A production-grade, modular backend for a **multi-vendor sustainable marketplace** — featuring real-time chat & bidding, secure Razorpay payments, verified reviews, Redis caching, and role-based access control.
 
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
 
---
 
## 📖 Table of Contents
 
- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Authentication & RBAC](#-authentication--rbac)
- [Realtime System](#-realtime-system)
- [Database Design](#-database-design)
- [Performance & Security](#-performance--security)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Design Decisions](#-design-decisions)
- [Future Improvements](#-future-improvements)
---
 
## 🚀 Overview
 
This backend powers a marketplace platform where:
 
- 🛒 **Buyers** browse, purchase, and review eco-friendly products
- 🏪 **Sellers** list and manage their sustainable product inventory
- ⚡ **Users** interact via real-time chat and live bidding
- 🔒 **System** ensures trust via verified purchase reviews and HMAC-secured payments
Built as a **modular monolith** — clean enough to reason about today, structured to scale into microservices tomorrow.
 
---
 
## ✨ Features
 
| Feature | Details |
|---|---|
| 🔐 Auth & RBAC | JWT-based auth with buyer / seller / admin roles |
| 🛍️ Product Management | Seller-owned listings with filtering & pagination |
| 🛒 Cart & Orders | Persistent cart, server-side pricing, stock validation |
| 💳 Payments | Razorpay integration with HMAC signature verification |
| ⭐ Reviews | Verified-purchase-only, one per user/product, rating aggregation |
| 💬 Real-time Chat | One-to-one Socket.io messaging with persistent storage |
| 🔨 Live Bidding | Real-time product bidding with highest-bid validation |
| ⚡ Caching | Redis TTL-based product listing cache |
| 📬 Background Jobs | BullMQ async email/notification processing |
| 🐳 Docker Ready | App + Redis containerized via docker-compose |
 
---
 
## 🧱 System Architecture
 
```
Client (React)
      │
      ▼
API Layer (Express.js)
      │
      ▼
┌─────────────────────────────────────┐
│          Domain Modules             │
│─────────────────────────────────────│
│  Auth │ User │ Product │ Order      │
│  Cart │ Review │ Payment            │
│  Chat (Socket) │ Bidding (Socket)   │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│        Infrastructure Layer         │
│─────────────────────────────────────│
│  MongoDB        (Primary DB)        │
│  Redis          (Cache + Pub/Sub)   │
│  BullMQ         (Background Jobs)   │
└─────────────────────────────────────┘
      │
      ▼
External Services:
  Razorpay (Payments) · Cloud Storage (Uploads)
```
 
---
 
## 🛠 Tech Stack
 
**Core**
- **Node.js + Express.js** — REST API framework
- **MongoDB + Mongoose** — NoSQL primary database
- **Socket.io** — Real-time chat & bidding
**Auth & Validation**
- **JWT** — Stateless authentication
- **bcrypt** — Password hashing
- **Zod** — Runtime request validation
**Performance & Reliability**
- **Redis** — Response caching + pub/sub
- **BullMQ** — Async background job queues
**Security**
- **Helmet** — HTTP security headers
- **Rate Limiting** — Request throttling
- **HMAC Verification** — Razorpay webhook security
**DevOps**
- **Docker + docker-compose** — Containerized services
- **Nginx** *(optional)* — Reverse proxy / load balancer
---
 
## 📁 Project Structure
 
```
src/
├── config/              # DB & Redis configuration
├── middleware/          # Auth guard, error handling
├── models/              # Mongoose schemas
├── modules/             # Feature-based domain modules
│   ├── auth/            #   Register, Login
│   ├── user/            #   Profile, Admin listing
│   ├── product/         #   CRUD, filtering, pagination
│   ├── cart/            #   Add/remove items
│   ├── order/           #   Create order from cart
│   ├── payment/         #   Razorpay create + verify
│   └── review/          #   Verified purchase reviews
├── socket/              # Real-time handlers
│   ├── chat.js          #   One-to-one messaging
│   └── bidding.js       #   Live product bidding
├── utils/               # JWT helpers, hashing utilities
├── app.js               # Express app setup
└── server.js            # Entry point
```
 
---
 
## 📡 API Reference
 
### Auth
 
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & receive JWT |
 
### Users
 
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/me` | Protected | Get own profile |
| GET | `/api/users` | Admin | List all users |
 
### Products
 
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Public | Browse with filters & pagination |
| POST | `/api/products` | Seller | Create new listing |
| PUT | `/api/products/:id` | Owner | Update listing |
| DELETE | `/api/products/:id` | Owner | Delete listing |
 
### Cart
 
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/cart` | Buyer | Add / remove cart items |
 
### Orders
 
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Buyer | Create order from cart |
 
### Payments
 
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/create` | Buyer | Create Razorpay order |
| POST | `/api/payments/verify` | Buyer | Verify payment & update stock |
 
### Reviews
 
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reviews` | Buyer | Submit verified purchase review |
 
**Standard Response Format**
 
```json
{
  "success": true,
  "data": {},
  "error": null
}
```
 
---
 
## 🔐 Authentication & RBAC
 
Authentication uses **JWT** tokens. Every protected route runs through:
 
```
protect → authorize("role")
```
 
**Token payload:**
```json
{ "id": "userId", "role": "buyer | seller | admin" }
```
 
**Role permissions:**
 
| Role | Can Do |
|---|---|
| `buyer` | Browse, purchase, review |
| `seller` | All buyer actions + manage own products |
| `admin` | Full access — user management, all data |
 
---
 
## ⚡ Realtime System
 
Built on **Socket.io** with Redis pub/sub for multi-instance support.
 
### Chat
 
```
join_chat       → Join a conversation room
send_message    → Send a message
receive_message → Receive incoming message
```
 
- One-to-one messaging
- Messages persisted to MongoDB
### Bidding
 
```
join_product  → Subscribe to a product's bid stream
place_bid     → Submit a bid
new_bid       → Broadcast updated highest bid
bid_error     → Reject invalid bid (below current highest)
```
 
- Real-time highest-bid validation
- Bid history persisted per product
---
 
## 🗄 Database Design
 
### Users
```js
{ name, email, password (hashed), role }
```
 
### Products
```js
{ title, price, sellerId, stock, sustainabilityScore, averageRating, totalReviews }
```
 
### Orders
```js
{ buyerId, items: [{ productId, quantity, price }], totalAmount, status, paymentId }
```
 
### Reviews
```js
{ userId, productId, rating, comment, verifiedPurchase }
```
 
### Bids / Messages
Lightweight documents supporting real-time features and persistent history.
 
---
 
## 🚀 Performance & Security
 
### Performance
- **Redis caching** on product listings with TTL-based invalidation
- **BullMQ** for async processing (notifications, emails) — no blocking the request cycle
- **Pagination** via `.limit()` + `.skip()` on all list endpoints
### Security
- JWT authentication on all protected routes
- Role-based authorization via middleware
- Password hashing with **bcrypt**
- Request validation with **Zod** — rejects malformed inputs at the boundary
- **Helmet** for HTTP security headers
- **Rate limiting** to prevent abuse
- **HMAC signature verification** on Razorpay payment webhooks
---
 
## 🏁 Getting Started
 
### Prerequisites
 
- Node.js >= 18
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Razorpay account (for payments)
### Installation
 
```bash
# Clone the repository
git clone https://github.com/Aashish257/sustainable-marketplace-backend.git
cd sustainable-marketplace-backend
 
# Install dependencies
npm install
```
 
### Environment Variables
 
Create a `.env` file in the root:
 
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sustainable-marketplace
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
 
REDIS_HOST=localhost
REDIS_PORT=6379
 
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
 
### Run Locally
 
```bash
# Development (with hot reload)
npm run dev
 
# Production
npm start
```
 
### Run with Docker
 
```bash
docker-compose up --build
```
 
This starts:
- **App** container on port `5000`
- **Redis** container on port `6379`
---
 
## 🚢 Deployment
 
| Component | Recommended Platform |
|---|---|
| Backend API | Render / Railway / AWS EC2 |
| MongoDB | MongoDB Atlas |
| Redis | Upstash |
| File Storage | Cloudinary / AWS S3 |
| Reverse Proxy | Nginx |
 
---
 
## 🧪 Testing
 
Test with **Postman** or **Thunder Client**.
 
Key scenarios to cover:
 
- ✅ Register + Login flow
- ✅ Role enforcement (buyer vs seller vs admin)
- ✅ Product ownership (only owner can edit/delete)
- ✅ Full order + payment flow (create → verify)
- ✅ Review restrictions (verified purchase, one per user/product)
- ✅ Real-time events (chat, bidding via Socket.io)
---
 
## 🧠 Design Decisions
 
**Modular Monolith over Microservices**
Each domain (auth, product, order, etc.) is a self-contained module with its own routes, controllers, and services. This keeps development fast and debugging simple, while making it straightforward to extract services later if traffic demands it.
 
**MongoDB**
Flexible schema accommodates evolving product attributes (e.g. `sustainabilityScore`) without migrations. Works well for the document-heavy nature of a marketplace.
 
**Redis as Both Cache and Pub/Sub**
Caching product listings reduces database load on the most frequently hit endpoint. Redis pub/sub powers the Socket.io adapter, enabling the real-time system to scale across multiple Node.js instances.
 
**Server-side Price Calculation**
Order totals are never trusted from the client. Prices are always recalculated server-side from the database at order creation time.
 
**What Was Deliberately Avoided**
- Kubernetes — unnecessary operational overhead at this scale
- Blockchain — adds complexity without clear marketplace benefit
- Heavy ML pipelines — out of scope; recommendation engine is a future addition
---
 
## 🔮 Future Improvements
 
- [ ] Advanced search with **Elasticsearch** (full-text, faceted filters)
- [ ] **Recommendation engine** based on purchase & browsing history
- [ ] **Seller analytics dashboard** (revenue, views, conversion rates)
- [ ] Email/SMS notifications via **SendGrid / Twilio**
- [ ] **Refresh token** rotation for enhanced session security
- [ ] API rate limiting per user (not just per IP)
---
 
## 👨‍💻 Author
 
**Aashish Shilkande**
M.Tech CSE (Software Engineering) — VJTI Mumbai
 
[![GitHub](https://img.shields.io/badge/GitHub-Aashish257-181717?style=flat&logo=github)](https://github.com/Aashish257)
 
---
 
## 📄 License
 
This project is licensed under the [MIT License](LICENSE).
