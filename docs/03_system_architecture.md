# 🏗️ Document 3: System Architecture Design (SAD)

## 1. High-Level Architecture Pattern

The Sustainable Local Marketplace utilizes a modern decoupled **Client-Server Architecture** featuring a single-page React client communicating with a Node.js/Express REST and WebSocket backend.

```
                  ┌──────────────────────┐
                  │      React SPA       │
                  │   (Vite Frontend)    │
                  └──────────┬───────────┘
                             │
            HTTPS Rest API   │   WebSockets (Socket.io)
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌────────────────────────────────────────────────────────┐
│                      Express API                       │
│                   (Backend Server)                     │
│                                                        │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────┐   │
│   │ Controllers  │──►│   Services   │──►│ Repos    │   │
│   └──────────────┘   └──────────────┘   └────┬─────┘   │
└──────────────────────────────────────────────┼─────────┘
                                               │
                                       ┌───────┴───────┐
                                       ▼               ▼
                                ┌────────────┐   ┌───────────┐
                                │  MongoDB   │   │   Redis   │
                                └────────────┘   └───────────┘
```

The backend code is organized according to a strict **Service-Repository Pattern**:
1. **Routing Layer**: Receives HTTP requests, executes global rate limiters, input validation middleware, and auth guards.
2. **Controller Layer**: Extracts request parameters (body, query, headers), coordinates basic response formatting, and forwards actions to the Service layer.
3. **Service Layer**: Implements business rules, performs permission/ownership validations, updates sustainability metrics, and coordinates repository calls.
4. **Repository Layer**: Coordinates Mongoose schema queries. Direct database commands are confined strictly to this layer.
5. **Database / Cache Model**: Decouples MongoDB data persistent structures from Redis transient cache states.

---

## 2. Component Directory Structure

The workspace is organized into separate client and server root packages:

```
e:\Susainable\
├── backend/
│   ├── src/
│   │   ├── config/         # DB, Redis, and global credentials
│   │   ├── middleware/     # Auth, error, cache, and rate-limiting
│   │   ├── models/         # MongoDB Mongoose schemas
│   │   ├── modules/        # Modulized routes, controllers, services, repos
│   │   │   ├── auth/
│   │   │   ├── product/
│   │   │   ├── user/
│   │   │   ├── review/
│   │   │   └── order/
│   │   ├── socket/         # Socket.io connection handlers and rooms
│   │   ├── workers/        # BullMQ background notification processors
│   │   ├── app.js          # App configuration
│   │   └── server.js       # HTTP and WebSocket listener
│   └── tests/              # Jest and HTTP test scripts
├── frontend/
│   ├── src/
│   │   ├── assets/         # Images and SVG icons
│   │   ├── shared/         # Reusable layouts, context, hooks
│   │   │   ├── components/ # Canvas leaf graphics, cards
│   │   │   └── state/      # Zustand stores (auth, cart)
│   │   ├── modules/        # Pages and routes
│   │   │   ├── auth/       # Login/Register views
│   │   │   ├── dashboard/  # Seller widgets
│   │   │   ├── home/       # Hero section and bento grid
│   │   │   └── products/   # Catalog details
│   │   └── Router.jsx      # Navigation guards
```

---

## 3. Core System Sequence Flows

### 3.1 Authentication & RBAC Guard Flow
```mermaid
sequenceDiagram
    actor Client as User Client
    participant API as Express API
    participant M as Auth Middleware
    participant S as UserService
    participant DB as MongoDB
    
    Client->>API: GET /api/users (Access Admin Area)
    API->>M: protect(req.headers.authorization)
    M->>M: Verify & Decode JWT
    alt Token Invalid/Expired
        M-->>Client: 401 Unauthorized
    else Token Valid
        M->>API: Set req.user = { id, role }
        API->>M: authorize("admin")
        alt Role is "buyer" or "seller"
            M-->>Client: 403 Forbidden
        else Role is "admin"
            M->>S: getUsersService()
            S->>DB: Find all users
            DB-->>S: Return users list
            S-->>Client: 200 Success (Users Payload)
        end
    end
```

### 3.2 Real-Time Bidding Flow (WebSockets)
```mermaid
sequenceDiagram
    participant C as Buyer Client
    participant S as Socket.IO Server
    participant DB as MongoDB (Mongoose)
    participant Q as Redis Queue (BullMQ)
    participant W as Notification Worker
    
    C->>S: join_product(productId)
    C->>S: place_bid(productId, amount)
    S->>DB: Find highest bid
    DB-->>S: Return highest bid / base price
    alt amount <= currentHigh
        S-->>C: bid_error("Bid must be higher...")
    else amount > currentHigh
        S->>DB: Save new bid
        S->>S: Broadcast "new_bid" to product room
        S->>S: Broadcast "notification" to product room
        S->>Q: addNotification("bid_update", data)
        Q->>W: Process background job
        W-->>W: Execute alert/email logic
    end
```

### 3.3 Real-Time Chat (WebSockets)
```mermaid
sequenceDiagram
    participant S_C as Sender Client
    participant S as Socket.IO Server
    participant R_C as Receiver Client
    participant DB as MongoDB
    
    S_C->>S: send_message(receiverId, message)
    S->>DB: Verify receiver & Save message
    S->>S: Emit "receive_message" to receiver's private room
    S->>S: Emit "message_sent" to sender's room
    S->>S: Emit "notification" to receiver's private room
```

### 3.4 Razorpay Payment & Atomic Stock Reduction Loop
```mermaid
sequenceDiagram
    actor C as Buyer Client
    participant S as Express Server
    participant R as Razorpay API
    participant DB as MongoDB
    
    C->>S: POST /api/payments/order (orderId)
    S->>DB: Get order details
    S->>R: orders.create(amount, currency)
    R-->>S: Return Razorpay Order ID
    S->>DB: Update order with razorpayOrderId
    S-->>C: Return Razorpay Order options
    C->>C: Open Razorpay checkout modal
    C->>S: POST /api/payments/verify (payment details, signature)
    S->>S: Verify HMAC SHA256 signature
    alt Verification Success
        S->>DB: Update order status to "paid" & save paymentId
        S->>DB: Atomic stock reduction (for each item)
        S-->>C: Return success response
    else Signature Invalid
        S-->>C: Return 400 Bad Request error
    end
```

---

## 4. Resilience Strategy (Redis Fail-Soft Fallbacks)

To prevent server crashes and keep the platform functional in environments where Redis may be unavailable (e.g. local developer machine without Docker, or server network disruption), the backend implements a **fail-soft strategy**:

1. **Caching Fallback**: The `cache.middleware.js` catches Redis errors. If the Redis server connection status is not `'ready'`, caching is skipped, and the controller queries MongoDB directly.
2. **WebSocket Scaling Fallback**: If Redis connection fails, the Socket.io initialization handles the error and switches to the default in-memory Adapter instead of crashing the process on the `redis-adapter`.
3. **Queue Fallback**: BullMQ queues are configured with `lazyConnect: true`. If Redis connection drops, notification job creations are logged and skipped rather than blocking core checkouts.
