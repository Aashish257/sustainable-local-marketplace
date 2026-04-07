# Auth API — Test Cases & Expected Results

All tests run against `http://localhost:5000`

---

## How To Run

1. Install VS Code extension: **REST Client** (by Huachao Mao)
2. Open `auth.test.http`
3. Click **"Send Request"** above each block
4. OR use **Postman** / **Thunder Client** with the same data

---

## TEST 1 — Register: Valid Input

**Request**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Aashish",
  "email": "test@test.com",
  "password": "123456"
}
```

**Expected Response**
```json
Status: 201 Created
{
  "success": true,
  "data": { "id": "<mongo_object_id>" }
}
```
**Result:** ☐ PASS  ☐ FAIL

---

## TEST 2 — Login: Correct Credentials

**Request**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "123456"
}
```

**Expected Response**
```json
Status: 200 OK
{
  "success": true,
  "data": { "token": "<jwt_token>" }
}
```
**Result:** ☐ PASS  ☐ FAIL

---

## EDGE CASE 1 — Register: Duplicate Email

**Request**
```
POST /api/auth/register
(same body as TEST 1 — run it a second time)
```

**Expected Response**
```json
Status: 400 Bad Request
{
  "success": false,
  "error": "User already exists"
}
```
**Result:** ☐ PASS  ☐ FAIL

---

## EDGE CASE 2 — Login: Wrong Password

**Request**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "wrongpassword"
}
```

**Expected Response**
```json
Status: 400 Bad Request
{
  "success": false,
  "error": "Invalid credentials"
}
```
**Result:** ☐ PASS  ☐ FAIL

---

## EDGE CASE 3 — Register: Invalid Email Format

**Request**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Aashish",
  "email": "not-an-email",
  "password": "123456"
}
```

**Expected Response**
```json
Status: 400 Bad Request
{
  "success": false,
  "error": "..." (Zod validation error)
}
```
**Result:** ☐ PASS  ☐ FAIL

---

## EDGE CASE 4 — Login: Non-existent User

**Request**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "ghost@nobody.com",
  "password": "123456"
}
```

**Expected Response**
```json
Status: 400 Bad Request
{
  "success": false,
  "error": "Invalid credentials"
}
```
**Result:** ☐ PASS  ☐ FAIL

---

## BONUS — Health Check

**Request**
```
GET /
```

**Expected Response**
```json
Status: 200 OK
{
  "success": true,
  "message": "Sustainable Marketplace API is running"
}
```
**Result:** ☐ PASS  ☐ FAIL

---

## Test Run Log

| # | Test Name | Status | Notes |
|---|-----------|--------|-------|
| 1 | Register valid | | |
| 2 | Login correct | | |
| E1 | Duplicate email | | |
| E2 | Wrong password | | |
| E3 | Invalid email format | | |
| E4 | Non-existent user | | |
| B | Health check | | |
