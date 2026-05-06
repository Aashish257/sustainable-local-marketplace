# 🌿 Sustainable Local Marketplace

A premium, production-grade full-stack marketplace connecting eco-conscious buyers with local sustainable sellers. Built with a modern React frontend and a highly scalable Node.js/Redis backend.

![Sustainable Marketplace Preview](https://via.placeholder.com/1200x600.png?text=Sustainable+Marketplace)

## 🚀 Key Features

### 🛍️ Premium Buyer Experience
- **Modern Aesthetics**: Stunning glassmorphism UI, fluid CSS animations, and a rich Emerald & Sage color palette.
- **Real-Time Bidding**: Participate in live auctions using low-latency WebSockets.
- **Instant Chat**: Connect directly with sellers via a persistent, floating real-time chat interface.
- **Secure Checkout**: End-to-end payment processing via Razorpay integration.
- **Order Tracking**: Comprehensive dashboard to track order status and payment history.

### 🏪 Seller & Admin Portals
- **Inventory Management**: Create and manage eco-friendly products with automated sustainability scoring.
- **Order Fulfillment**: Dedicated seller dashboards to view and process incoming orders.
- **Admin Analytics**: System-wide statistics on total users, orders, and gross revenue.

### ⚙️ Enterprise-Grade Backend
- **Real-time Engine**: Powered by Socket.io with Redis Pub/Sub for horizontal scaling.
- **High Performance**: Redis-based caching layer and BullMQ background workers.
- **Security Hardened**: Helmet, Express-Rate-Limit, Zod validation, and JWT-based RBAC authentication.

---

## 🛠️ Architecture & Tech Stack

### Frontend (Client)
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (UI/Cart), TanStack React Query (Server State)
- **Routing**: React Router v6

### Backend (API)
- **Runtime**: Node.js (ES Modules), Express.js
- **Database**: MongoDB (Mongoose)
- **Cache & PubSub**: Redis (ioredis)
- **Real-time**: Socket.io

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas)
- Redis (Running locally or via Docker)

### 1. Installation
Clone the repository and install dependencies for the entire workspace:
```bash
git clone <repo-url>
cd sustainable-marketplace
npm run install:all
```

### 2. Environment Configuration
You need two `.env` files.

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/sustainable_market
JWT_SECRET=your_super_secret_jwt_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### 3. Run the Platform
Start both the Frontend and Backend concurrently with a single command from the root directory:
```bash
npm run dev
```
- Frontend will be available at `http://localhost:5173`
- Backend API will be available at `http://localhost:5000`

---

## 🐳 Docker Deployment (Backend)
The backend is fully containerized for production deployments.
```bash
cd backend
docker-compose up --build -d
```

## 📄 License
MIT License
