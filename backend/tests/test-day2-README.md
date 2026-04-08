# Day 2 Test Script Details

The `test-day2.js` script dynamically tests our Authorization implementation. 

## Prerequisites
Before running, the primary backend server must be running:
```bash
cd backend
npm start
```

## How to use
```bash
cd backend/tests
node test-day2.js
```

## What it tests
1. **User Module Architecture Structure**: Evaluates creation and flow logic across Controller, Service, and Repository.
2. **Access Security**: Evaluates that the `password` field is definitively stripped before JSON mapping on `/api/users/me`.
3. **Role-Based Middlewares**: Evaluates strict fallback mappings (`user.role == buyer` rejecting access to purely administrative endpoints `/api/users` with HTTP Error `403`).
4. **Token Handling**: Evaluates success paths (valid token -> `200`) and unhandled paths (missing, invalid token -> `401`).
