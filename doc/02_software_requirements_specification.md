# 📋 Document 2: Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the Sustainable Local Marketplace platform. It outlines the functional features, user interactions, system constraints, and non-functional behaviors for both client and server layers.

### 1.2 Document Conventions
- **MUST / REQUIRED**: Indicates mandatory features critical for core transactions and system safety.
- **SHOULD / RECOMMENDED**: Indicates high-priority features that improve user experience or performance but aren't strictly blockers.
- **MAY**: Indicates optional or deferred features.

---

## 2. Overall Description

### 2.1 Product Perspective
The Sustainable Local Marketplace is a standalone full-stack web application. It uses a decoupled client-server architecture where a React (Vite) single-page application (SPA) communicates with a Node.js (Express) backend API. It relies on MongoDB for database storage, Redis for session adapter caching, and Socket.io for low-latency bidirectional communications.

```
┌──────────────┐     REST (HTTPS) / WebSockets (WSS)     ┌──────────────┐
│  React SPA   │ ◄─────────────────────────────────────► │ Express API  │
│ (Client App) │                                         │ (App Server) │
└──────────────┘                                         └──────┬───────┘
                                                                │
                                                ┌───────────────┼───────────────┐
                                                ▼               ▼               ▼
                                         ┌────────────┐  ┌────────────┐  ┌────────────┐
                                         │  MongoDB   │  │   Redis    │  │  Razorpay  │
                                         │ (Database) │  │(Cache/Queue│  │ (Payments) │
                                         └────────────┘  └────────────┘  └────────────┘
```

### 2.2 User Classes and Characteristics
1. **Buyers**: Eco-conscious consumers. Must be authenticated to access cart, submit checkouts, message sellers, or place auction bids.
2. **Sellers**: Local producers. Must have a seller-validated role to access dashboards, list products, specify sustainability metrics, and track order fulfillment.
3. **Admins**: Platform operators. Must have administrative roles to oversee transactions, moderate listings, and query platform analytics.

---

## 3. Functional Requirements

### 3.1 User Authentication & Profile
- **FR-1.1 [Registration]**: Users MUST be able to register by providing name, email, password, and selecting a role (`buyer` or `seller`). Passwords must be hashed using bcrypt.
- **FR-1.2 [Login]**: Users MUST authenticate using email and password to receive a JWT token. JWT payloads must strictly contain the user ID and role.
- **FR-1.3 [Profile query]**: Authenticated users MUST be able to query their own profile details (excluding password hash) via `/api/users/me`.
- **FR-1.4 [Role Check]**: The server MUST enforce Role-Based Access Control (RBAC). Access to user directories and seller panels must return `403 Forbidden` if roles are mismatched.

### 3.2 Product & Sustainability Management
- **FR-2.1 [Product CRUD]**: Sellers MUST be able to create, read, update, and delete their own products.
- **FR-2.2 [Ownership Enforcement]**: The server MUST block product modifications or deletions by anyone other than the original creator (except admins).
- **FR-2.3 [Sustainability score]**: Every product listing MUST include a structured sustainability score ranging from 0 to 10 based on predefined ecological parameters (sourcing, packaging, carbon footprint).
- **FR-2.4 [Filtering & Search]**: Buyers MUST be able to query products filtering by category, minimum price, and maximum price with default server-side pagination.
- **FR-2.5 [Reviews]**: Buyers MUST be able to leave reviews (rating 1-5 and comment text). The system MUST atomically recalculate the product's average rating upon review submission.

### 3.3 Real-Time Communications & Chat
- **FR-3.1 [Direct Messages]**: Buyers and sellers MUST be able to establish direct real-time chat sessions using Socket.io.
- **FR-3.2 [Chat History]**: Chat messages MUST be saved to MongoDB to enable scrolling history recovery.
- **FR-3.3 [Typing status]**: The client SHOULD show real-time typing indicators when the counterpart is typing.

### 3.4 Interactive Live Bidding (Auctions)
- **FR-4.1 [Auction Room]**: Buyers MUST be able to join an active product's WebSocket auction room.
- **FR-4.2 [Bid Broadcast]**: Bids placed via `place_bid` MUST check if they exceed the current highest bid. If valid, the new high bid MUST be broadcasted instantly to all clients in the room.
- **FR-4.3 [Bid Integrity]**: The system MUST reject bids equal to or lower than the current highest bid.

### 3.5 Checkout & Razorpay Integration
- **FR-5.1 [Razorpay Order]**: Buyers MUST be able to place orders. The server MUST query the Razorpay API to generate a valid Razorpay Order ID.
- **FR-5.2 [HMAC Verification]**: Upon client payment authorization, the server MUST verify the payment signature using SHA256 HMAC.
- **FR-5.3 [Stock Deduction]**: The server MUST perform atomic inventory stock deductions on successful payments to avoid overselling.

---

## 4. Non-Functional Requirements

### 4.1 Performance & Scalability
- **NFR-1.1 [Latency]**: Live bid broadcasts and chat transfers must be delivered to clients within 200ms of socket trigger.
- **NFR-1.2 [Caching]**: Product GET queries must be cached in Redis with a Time-To-Live (TTL) of 300 seconds, and cleared automatically on product updates/deletions.
- **NFR-1.3 [Queue Durability]**: Notifications and emails must be offloaded to BullMQ background workers to prevent clogging HTTP threads.

### 4.2 Security & Compliance
- **NFR-2.1 [JWT Expiry]**: Authentication JWT tokens must expire after 7 days.
- **NFR-2.2 [Rate Limiting]**: APIs must enforce request rate-limiting (e.g., 100 requests per 15 minutes globally, 50 requests per 15 minutes for auth in development, 5 attempts per hour in production).
- **NFR-2.3 [Input Sanitization]**: All incoming HTTP payloads must be validated using Zod schemas before hitting databases.

### 4.3 Usability & Theme
- **NFR-3.1 [Responsive Design]**: The user interface must be fully mobile-responsive.
- **NFR-3.2 [Glassmorphic Theme]**: The UI must implement a glassmorphic aesthetic matching Emerald/Sage palettes with frosted border effects.
- **NFR-3.3 [Dark Mode Sync]**: The theme must support manual Light/Dark toggles and synchronize with the client device's default settings using LocalStorage.
