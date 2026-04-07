# Sustainable Local Marketplace - Backend

This is the backend API for the Sustainable Local Marketplace application, built with Express.js and MongoDB.

## Features Enforced

- **Architecture:** Clean Layered Architecture (`Controller -> Service -> Repository`)
- **Authentication:** JWT-based user authentication (Register, Login)
- **Validation:** Zod schema validation for incoming requests
- **Security:** Passwords securely hashed with `bcrypt`, environment variables managed via `.dotenv`
- **Error Handling:** Centralized global error handling

## Tech Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Token (JWT)
- bcrypt
- Zod

## Folder Structure

```text
backend/
├── src/
│   ├── app.js               # Express application configuration
│   ├── server.js            # Entry point for the server
│   ├── config/              # Database connection 
│   ├── middleware/          # Auth & Error middlewares
│   ├── models/              # Mongoose schemas/models (e.g., user.model.js)
│   ├── modules/             # Business logic domains
│   │   └── auth/            
│   │       ├── auth.routes.js
│   │       ├── auth.controller.js
│   │       ├── auth.service.js
│   │       ├── auth.repository.js
│   │       └── auth.validation.js
│   └── utils/               # Helpers like hash.js, jwt.js
├── tests/                   # REST format API tests & test runner
├── package.json             # NPM dependencies & scripts Setup
└── .env                     # Environment Config (ignored in git)
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables inside `backend/.env`:
   ```bash
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/sustainable_marketplace
   JWT_SECRET=your_super_secret_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth Endpoints
- `POST /api/auth/register` - Create a new user (Requires `name`, `email`, `password`)
- `POST /api/auth/login` - Authenticate a user to get a JWT token (Requires `email`, `password`)
- `GET /` - Health check route

## Running Tests

An automated test script using an in-memory database (`mongodb-memory-server`) is provided, so you do not need a local MongoDB actively running to pass the tests.

```bash
cd backend
node tests/run-tests.js
```

Or you can use HTTP REST Clients (like VS Code REST Client/Thunder Client/Postman) utilizing `backend/tests/auth.test.http`.
