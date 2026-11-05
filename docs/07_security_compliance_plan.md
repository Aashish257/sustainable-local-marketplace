# 🛡️ Document 7: Security & Compliance Plan

This document outlines the security architecture, authentication mechanisms, authorization boundaries (RBAC), data sanitization protocols, and request rate-limiting configurations implemented in the Sustainable Local Marketplace.

---

## 1. Authentication Security

### 1.1 Password Hashing
- **Algorithm**: `bcrypt` (using `10` salt rounds).
- **Rule**: Password hashes are computed at the database boundary during user creation. Password hashes MUST NEVER be stored in plain text or logged to logging files.
- **Mongoose Exclude**: The `password` field in the user schema is excluded by default in repository database queries (`.select("-password")`) to prevent accidental leaks in profiles APIs.

### 1.2 JSON Web Tokens (JWT)
- **Signature Algorithm**: HMAC SHA-256.
- **Payload Schema**: Contains user ID (`id`) and RBAC role (`role`). No sensitive parameters (passwords, emails) are encoded inside the token.
- **Expiration Policy**: `7 days` (configured via env `JWT_EXPIRES_IN=7d`).
- **Storage**: Client stores token in LocalStorage and attaches it as a bearer header to subsequent API requests:
  `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Authorization Boundaries (RBAC Middleware)

The platform enforces access controls through two backend middleware guards:

```
                  ┌──────────────────────┐
                  │   Incoming Request   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  protect middleware  │ (Decodes JWT, sets req.user)
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ authorize middleware │ (Enforces role matching)
                  └──────────┬───────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
             Allowed Roles      Disallowed Roles
             (Proceed to API)   (403 Forbidden)
```

### 2.1 Protect Guard (`protect`)
- Validates the presence of the Bearer token in the `Authorization` header.
- Decodes and verifies the token signature using the secret key `JWT_SECRET`.
- Attaches the decoded payload to the Express request context as `req.user`.

### 2.2 Authorize Guard (`authorize(...roles)`)
- Restricts route execution to specific roles: `"buyer"`, `"seller"`, `"admin"`.
- If the token payload `req.user` role is not present in the allowed roles array, the request is terminated with a `403 Forbidden` JSON error payload.

---

## 3. Data Sanitization & Input Validation (Zod)

To prevent SQL/NoSQL Injection, Cross-Site Scripting (XSS), and data corruption, all incoming payloads are validated at the API boundary using Zod schemas:

### 3.1 Example Zod Product Schema
```javascript
import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    price: z.number().positive("Price must be a positive number"),
    category: z.string().optional(),
    stock: z.number().int().nonnegative().optional(),
    sustainabilityScore: z.number().min(0).max(10).optional(),
    images: z.array(z.string().url()).optional()
  })
});
```

### 3.2 Validation Middleware Execution
- The `validate(schema)` middleware inspects `req.body`, `req.query`, and `req.params`.
- If validation fails, it intercepts the request, returning a `400 Bad Request` with a structured list of validation errors.

---

## 4. Rate Limiting

To mitigate Denial of Service (DoS) and Brute-Force login attacks, the application implements distinct rate limits:

1. **Global API Limiter**:
   - Limit: Capped at `100 requests per 15 minutes` per IP address.
   - Applied to: All routes under `/api/*`.
2. **Auth API Limiter (Register/Login)**:
   - Development Limit: Relaxed to `50 requests per 15 minutes` to facilitate automated testing workflows.
   - Production Limit: Enforced at `5 attempts per hour` per IP address to safeguard accounts against dictionary attacks.

---

## 5. Error Sanitization & Logging

- **Express Error Interceptor**: Custom error handler middleware intercepts all unhandled errors.
- **Production Isolation**: In production mode (`NODE_ENV=production`), the handler hides detailed database stack traces from the API response to prevent system mapping. It returns general messages like `"Server Error"`.
- **Winston Audit Logs**: Actual error objects, database stack traces, and request payloads are recorded by the backend using Winston logger into `logs/error.log`.
