# 🔌 Document 5: API Specification

This document defines the REST API routes, parameter validations, and WebSocket events used by the Sustainable Local Marketplace application. All REST endpoints return JSON payloads.

---

## 1. Global Configurations
- **Base URL**: `http://localhost:5000/api` (Production base depends on DNS configuration)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (For protected endpoints)

---

## 2. Authentication & User API

### 2.1 User Registration
- **Route**: `POST /api/auth/register`
- **Access**: Public
- **Body Parameters**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "strongpassword123",
    "role": "seller" 
  }
  ```
  *(Role can be either `"buyer"` or `"seller"`)*
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "data": {
      "id": "603d2e9e...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "seller"
    }
  }
  ```

### 2.2 User Login
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Body Parameters**:
  ```json
  {
    "email": "jane@example.com",
    "password": "strongpassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "data": {
      "id": "603d2e9e...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "seller"
    }
  }
  ```

### 2.3 Get Current User Profile
- **Route**: `GET /api/users/me`
- **Access**: Protected (Logged-in User)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "603d2e9e...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "seller"
    }
  }
  ```

### 2.4 Get All Users (Admin Only)
- **Route**: `GET /api/users`
- **Access**: Protected (Admin Role Only)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "603d2e9e...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "seller"
      }
    ]
  }
  ```

---

## 3. Product Catalog API

### 3.1 Get Paginated Products
- **Route**: `GET /api/products`
- **Access**: Public
- **Query Parameters**:
  - `category` (optional, string)
  - `minPrice` (optional, number)
  - `maxPrice` (optional, number)
  - `page` (optional, default: `1`)
  - `limit` (optional, default: `10`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    },
    "data": [
      {
        "_id": "603d2eef...",
        "title": "Eco Bamboo Straws",
        "description": "100% natural organic bamboo straws.",
        "price": 299,
        "category": "home",
        "sustainabilityScore": 9,
        "averageRating": 4.5,
        "totalReviews": 12,
        "images": ["http://res.cloudinary.com/..."]
      }
    ]
  }
  ```

### 3.2 Create Product
- **Route**: `POST /api/products`
- **Access**: Protected (Sellers Only)
- **Body Parameters**:
  ```json
  {
    "title": "Eco Bamboo Straws",
    "description": "100% natural organic bamboo straws.",
    "price": 299,
    "category": "home",
    "stock": 50,
    "sustainabilityScore": 9,
    "images": ["http://res.cloudinary.com/..."]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603d2eef...",
      "title": "Eco Bamboo Straws",
      "sellerId": "603d2e9e...",
      "price": 299,
      "category": "home",
      "stock": 50,
      "sustainabilityScore": 9
    }
  }
  ```

### 3.3 Update Product
- **Route**: `PUT /api/products/:id`
- **Access**: Protected (Sellers - Ownership Check Enforced)
- **Response (200 OK)**: Returns updated product object structure.

### 3.4 Delete Product
- **Route**: `DELETE /api/products/:id`
- **Access**: Protected (Sellers - Ownership Check Enforced)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product removed successfully"
  }
  ```

---

## 4. Review API

### 4.1 Create Review
- **Route**: `POST /api/reviews`
- **Access**: Protected (Buyers Only)
- **Body Parameters**:
  ```json
  {
    "productId": "603d2eef...",
    "rating": 5,
    "comment": "Excellent quality!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603d2ffd...",
      "productId": "603d2eef...",
      "userId": "603d2abc...",
      "rating": 5,
      "comment": "Excellent quality!"
    }
  }
  ```

---

## 5. Order & Payment API

### 5.1 Create Local Order
- **Route**: `POST /api/orders`
- **Access**: Protected (Buyers Only)
- **Body Parameters**:
  ```json
  {
    "items": [
      {
        "productId": "603d2eef...",
        "quantity": 2,
        "price": 299
      }
    ],
    "totalAmount": 598
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "603d3aaa...",
      "buyerId": "603d2abc...",
      "items": [...],
      "totalAmount": 598,
      "status": "pending"
    }
  }
  ```

### 5.2 Generate Razorpay Order
- **Route**: `POST /api/payments/create`
- **Access**: Protected (Logged-in User)
- **Body Parameters**:
  ```json
  {
    "orderId": "603d3aaa..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "order_HpHx...",
      "entity": "order",
      "amount": 59800,
      "currency": "INR",
      "receipt": "603d3aaa..."
    }
  }
  ```

### 5.3 Verify Razorpay Payment Signature
- **Route**: `POST /api/payments/verify`
- **Access**: Protected (Logged-in User)
- **Body Parameters**:
  ```json
  {
    "razorpay_order_id": "order_HpHx...",
    "razorpay_payment_id": "pay_HpHz...",
    "razorpay_signature": "sha256SignatureValue..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment verified and order updated successfully",
    "order": {
      "_id": "603d3aaa...",
      "status": "paid",
      "paymentId": "pay_HpHz..."
    }
  }
  ```

---

## 6. WebSocket Events (Socket.io)

### 6.1 Bidding Namespace
- **Room Join**: Emitting `join_product(productId)` routes the user socket to `product_${productId}` room.
- **Client Emits**:
  - `place_bid(data)`:
    ```json
    { "productId": "603d2eef...", "amount": 350 }
    ```
- **Server Broadcasts** (To all room members on valid bid):
  - `new_bid(bidDoc)`:
    ```json
    { "productId": "603d2eef...", "bidderId": "603d2abc...", "amount": 350, "createdAt": "..." }
    ```
- **Server Emits** (Direct back to bidder on error):
  - `bid_error(message)`: `"Bid must be higher than current highest bid"`

### 6.2 Chat Namespace
- **Room Join**: Done automatically on user identity authentication; joins private `user_${userId}` room.
- **Client Emits**:
  - `send_message(data)`:
    ```json
    { "receiverId": "603d2e9e...", "content": "Is this product local?" }
    ```
- **Server Emits** (To recipient private room):
  - `receive_message(messageDoc)`:
    ```json
    { "senderId": "603d2abc...", "receiverId": "603d2e9e...", "content": "Is this product local?", "createdAt": "..." }
    ```
