# 🚀 Hosting & DevOps Deployment Guide
## Sustainable Local Marketplace

**Last Updated**: 2026-10-20  
**Stack**: Vercel + Render + MongoDB Atlas + Upstash Redis + Cloudinary

---

## Architecture Overview

```
Browser → Cloudflare CDN/WAF
       → Vercel (React SPA, static)
       → Render (Node.js API + Socket.io)
           → MongoDB Atlas M10 (ap-south-1)
           → Upstash Redis TLS (ap-south-1)
           → Cloudinary (images)
           → Razorpay (payments)
           → Gmail SMTP → SendGrid (email)
           → Sentry (error monitoring)
```

---

## Step 1: MongoDB Atlas

### 1.1 Create Cluster
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create Organisation → Project: `sustainlocal-prod`
3. Build Database → **M10 Dedicated** (never M0 Shared in production)
4. Cloud: AWS, Region: **ap-south-1 (Mumbai)**
5. Cluster name: `sustainlocal-cluster`

### 1.2 Database User
```
Username: sustainlocal_prod
Password: <generate 32-char random>
Built-in role: readWrite on database "sustainlocal"
```
⚠️ Never use Atlas admin credentials in app code.

### 1.3 Network Access (IP Allowlist)
```
1. Temporarily allow 0.0.0.0/0 for initial setup
2. After Render deploy: get static IPs from Render dashboard
   → Add each Render IP to Atlas allowlist
3. Remove 0.0.0.0/0 after IPs are confirmed
```

### 1.4 Connection String
```
mongodb+srv://sustainlocal_prod:<password>@sustainlocal-cluster.xxxxx.mongodb.net/sustainlocal?retryWrites=true&w=majority
```

### 1.5 Atlas Search Index (for product search)
Navigate to Atlas Search → Create Search Index → JSON editor:
```json
{
  "collectionName": "products",
  "database": "sustainlocal",
  "name": "product_search",
  "mappings": {
    "dynamic": false,
    "fields": {
      "title":       [{ "type": "string", "analyzer": "lucene.standard" }],
      "description": [{ "type": "string", "analyzer": "lucene.standard" }],
      "tags":        [{ "type": "string", "analyzer": "lucene.keyword" }]
    }
  }
}
```

### 1.6 Backup
- Enable **Continuous Cloud Backup**
- Snapshot schedule: every 6 hours
- Retention: 7 days
- Alerts: CPU > 80%, Storage > 80% → email admin

---

## Step 2: Upstash Redis

### 2.1 Create Database
1. Go to [console.upstash.com](https://console.upstash.com)
2. Create Database → Name: `sustainlocal-redis`
3. Region: **ap-southeast-1 (Singapore)** or **ap-south-1 (Mumbai)** — closest to Render
4. Type: Regional (not Global for MVP)
5. Enable **TLS** ✅

### 2.2 Get Connection URL
From Upstash Console → Database Details:
```
REDIS_URL: rediss://default:<password>@<endpoint>.upstash.io:6379
```
Note: `rediss://` (double s) = TLS enabled.

### 2.3 Memory Policy
In Upstash Console → Eviction:
```
maxmemory-policy: allkeys-lru
```
This ensures cache keys are evicted when memory is full (safe for our use case).

---

## Step 3: Cloudinary

### 3.1 Account Setup
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Cloud name: `sustainlocal` (or auto-assigned)
3. Note: Cloud Name, API Key, API Secret

### 3.2 Upload Preset (Signed Uploads — Required for Security)
Settings → Upload → Upload presets → Add upload preset:
```
Preset name:      sustainlocal_products
Signing mode:     Signed                    ← NOT unsigned
Folder:           products/
Allowed formats:  jpg, png, webp
Max file size:    5242880 (5MB)
Transformation:   f_auto, q_auto           ← Auto format + quality
```

### 3.3 Transformation URLs for Product Images
```javascript
// utils/cloudinary.js
export const getProductImageUrl = (url, { width = 400, height = 400 } = {}) => {
  if (!url) return '/placeholder-product.webp';
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`);
};

// Thumbnail (product card): getProductImageUrl(url, { width: 400, height: 400 })
// Detail hero (full width): getProductImageUrl(url, { width: 1200, height: 800 })
// Avatar: getProductImageUrl(url, { width: 96, height: 96 })
```

---

## Step 4: Razorpay

### 4.1 Activate Live Account
1. Login to [razorpay.com](https://razorpay.com)
2. Complete KYC verification (required for live payments)
3. Settings → API Keys → Generate Live Key
4. Copy: `key_id` (public) and `key_secret` (private)

### 4.2 Test Cards (for staging/dev)
```
Card:     4111 1111 1111 1111
Expiry:   Any future date
CVV:      Any 3 digits
OTP:      "success" → payment succeeds
OTP:      "failure" → payment fails
```

### 4.3 Webhook (Optional — Phase 2)
For payment failure recovery and dispute handling:
```
Webhook URL: https://api.sustainlocal.in/api/webhooks/razorpay
Events: payment.captured, payment.failed, refund.created
Secret: <generate and store as RAZORPAY_WEBHOOK_SECRET>
```

---

## Step 5: Gmail SMTP (Email)

### 5.1 App Password Setup
1. Google Account → Security → 2-Step Verification (must be ON)
2. Security → App passwords → Select app: Mail, Select device: Other
3. Enter name: `SustainLocal Backend`
4. Copy the 16-character app password

### 5.2 Nodemailer Config
```javascript
// config/smtp.js
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT), // 587
  secure: false,                    // false for port 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,    // noreply@sustainlocal.in
    pass: process.env.SMTP_PASS,    // 16-char app password
  },
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) logger.warn('SMTP connection failed', { error: error.message });
  else logger.info('SMTP ready');
});
```

---

## Step 6: Sentry (Error Monitoring)

### 6.1 Setup
1. Create account at [sentry.io](https://sentry.io)
2. Create project → Platform: Node.js (backend) + React (frontend)
3. Copy DSN for each project

### 6.2 Backend Integration
```javascript
// server.js (top of file)
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});

// After all routes, before error handler:
app.use(Sentry.Handlers.errorHandler());
```

### 6.3 Frontend Integration
```javascript
// main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  integrations: [Sentry.browserTracingIntegration()],
});
```

---

## Step 7: Backend Deploy — Render

### 7.1 Create Web Service
1. Go to [render.com](https://render.com)
2. New → Web Service → Connect GitHub repo
3. Settings:
   ```
   Name:             sustainlocal-api
   Root Directory:   backend
   Environment:      Node
   Build Command:    npm ci
   Start Command:    node src/server.js
   Instance Type:    Starter ($7/mo) → Upgrade to Standard ($25/mo) at scale
   Region:           Singapore (ap-southeast-1) — closest to Atlas ap-south-1
   ```

### 7.2 Environment Variables in Render
Navigate to: Web Service → Environment → Add each variable:
```
NODE_ENV              = production
PORT                  = 5000
FRONTEND_URL          = https://sustainlocal.vercel.app
MONGODB_URI           = mongodb+srv://...   (from Atlas)
REDIS_URL             = rediss://...        (from Upstash)
REDIS_TLS             = true
JWT_SECRET            = <64-char-random>
JWT_EXPIRES_IN        = 7d
BCRYPT_ROUNDS         = 12
RAZORPAY_KEY_ID       = rzp_live_...
RAZORPAY_KEY_SECRET   = ...
CLOUDINARY_CLOUD_NAME = ...
CLOUDINARY_API_KEY    = ...
CLOUDINARY_API_SECRET = ...
SMTP_HOST             = smtp.gmail.com
SMTP_PORT             = 587
SMTP_SECURE           = false
SMTP_USER             = noreply@sustainlocal.in
SMTP_PASS             = <app-password>
FROM_EMAIL            = Sustain Local <noreply@sustainlocal.in>
RATE_LIMIT_MAX        = 100
RATE_LIMIT_WINDOW_MS  = 900000
AUTH_RATE_LIMIT_MAX   = 5
AUTH_RATE_LIMIT_WINDOW_MS = 3600000
SENTRY_DSN            = https://...
```

### 7.3 Health Check
```
Render → Web Service → Settings → Health Check Path: /api/health
```

### 7.4 Auto-Deploy
Render auto-deploys on push to `main` branch (enabled by default). For manual deploy:
```bash
# Trigger via Render deploy hook (store URL in GitHub Secrets)
curl -X POST $RENDER_DEPLOY_HOOK_URL
```

### 7.5 Get Static Outbound IPs
```
Render Dashboard → Web Service → Info → Outbound IPs
```
Add these to MongoDB Atlas IP Allowlist.

---

## Step 8: Frontend Deploy — Vercel

### 8.1 Create Project
1. Go to [vercel.com](https://vercel.com)
2. Add New Project → Import GitHub repo
3. Settings:
   ```
   Framework Preset:  Vite
   Root Directory:    frontend
   Build Command:     npm run build
   Output Directory:  dist
   ```

### 8.2 Environment Variables in Vercel
Project → Settings → Environment Variables:
```
VITE_API_URL              = https://api.sustainlocal.in/api
VITE_SOCKET_URL           = wss://api.sustainlocal.in
VITE_RAZORPAY_KEY_ID      = rzp_live_...
VITE_CLOUDINARY_CLOUD_NAME = your-cloud-name
VITE_SENTRY_DSN           = https://...    (frontend project DSN)
```
⚠️ All VITE_ variables are bundled into client JS — NEVER put secrets here.

### 8.3 SPA Routing Fix
```json
// frontend/vercel.json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 8.4 Custom Domain
```
Vercel → Project → Settings → Domains
Add: sustainlocal.in
Add: www.sustainlocal.in (redirect to sustainlocal.in)
```

---

## Step 9: DNS — Cloudflare

### 9.1 Add Site
1. Add `sustainlocal.in` to Cloudflare
2. Update nameservers at domain registrar to Cloudflare's NS

### 9.2 DNS Records
```
Type  Name    Value                               Proxy
A     @       76.76.21.21  (Vercel IP)            ✅ Proxied
A     @       76.76.21.123 (Vercel IP)            ✅ Proxied
CNAME www     cname.vercel-dns.com                ✅ Proxied
CNAME api     sustainlocal-api.onrender.com       ✅ Proxied

# Email
MX    @       aspmx.l.google.com   (priority 1)
MX    @       alt1.aspmx.l.google.com (priority 5)
TXT   @       "v=spf1 include:_spf.google.com ~all"
```

### 9.3 Cloudflare Settings
```
SSL/TLS → Full (strict)     ← Requires valid cert on origin (Render/Vercel auto-TLS)
Speed → Minify → JS, CSS, HTML: ON
Caching → Browser Cache TTL: 4 hours
Security → Bot Fight Mode: ON
Security → WAF → Managed Ruleset: ON
```

---

## Step 10: GitHub Actions CI/CD

### 10.1 Backend Pipeline
```yaml
# .github/workflows/backend.yml
name: Backend CI/CD
on:
  push:
    branches: [main]
    paths: ['backend/**']
  pull_request:
    branches: [main]
    paths: ['backend/**']

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports: ['27017:27017']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: 'backend/package-lock.json' }
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test
        env:
          NODE_ENV: test
          PORT: 5001
          MONGODB_URI: mongodb://localhost:27017/sustainlocal_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-jwt-secret-at-least-32-chars-long
          JWT_EXPIRES_IN: 1d
          BCRYPT_ROUNDS: 4
          RAZORPAY_KEY_ID: rzp_test_dummy
          RAZORPAY_KEY_SECRET: test_dummy_secret
          CLOUDINARY_CLOUD_NAME: test
          CLOUDINARY_API_KEY: "000"
          CLOUDINARY_API_SECRET: test
          SMTP_HOST: localhost
          SMTP_PORT: 1025
          FROM_EMAIL: test@test.com
      - name: Check for vulnerabilities
        run: cd backend && npm audit --audit-level=high

  deploy:
    name: Deploy to Render
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Trigger Render deploy
        run: curl --fail -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"
```

### 10.2 Frontend Pipeline
```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD
on:
  push:
    branches: [main]
    paths: ['frontend/**']
  pull_request:
    branches: [main]
    paths: ['frontend/**']

jobs:
  build-test:
    name: Build & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: 'frontend/package-lock.json' }
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Type check & lint
        run: cd frontend && npm run lint
      - name: Build
        run: cd frontend && npm run build
        env:
          VITE_API_URL: https://api.sustainlocal.in/api
          VITE_SOCKET_URL: wss://api.sustainlocal.in
          VITE_RAZORPAY_KEY_ID: ${{ secrets.VITE_RAZORPAY_KEY_ID }}
          VITE_CLOUDINARY_CLOUD_NAME: ${{ secrets.VITE_CLOUDINARY_CLOUD_NAME }}
      - name: Check bundle size
        run: |
          BUNDLE_SIZE=$(du -sk frontend/dist | cut -f1)
          echo "Bundle size: ${BUNDLE_SIZE}KB"
          if [ "$BUNDLE_SIZE" -gt 3000 ]; then
            echo "::warning::Bundle exceeds 3MB threshold"
          fi

  deploy:
    name: Deploy to Vercel
    needs: build-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
          vercel-args: '--prod'
```

### 10.3 Required GitHub Secrets
```
RENDER_DEPLOY_HOOK_URL    → Render dashboard → Web Service → Deploy hook URL
VERCEL_TOKEN              → Vercel dashboard → Account → Tokens
VERCEL_ORG_ID             → vercel.com/account → General → ID
VERCEL_PROJECT_ID         → Vercel project → Settings → General → Project ID
VITE_RAZORPAY_KEY_ID      → Razorpay live key_id (public, safe)
VITE_CLOUDINARY_CLOUD_NAME → Cloudinary cloud name (public, safe)
```

---

## Step 11: Docker (Local Development)

### 11.1 `docker-compose.yml` (root directory)
```yaml
version: '3.9'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
      PORT: 5000
      MONGODB_URI: mongodb://mongo:27017/sustainlocal_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-minimum-32-characters-here
      JWT_EXPIRES_IN: 7d
      BCRYPT_ROUNDS: 10
      RAZORPAY_KEY_ID: rzp_test_xxxx
      RAZORPAY_KEY_SECRET: test_secret
      CLOUDINARY_CLOUD_NAME: dev-cloud
      CLOUDINARY_API_KEY: "000000000000000"
      CLOUDINARY_API_SECRET: dev_secret
      SMTP_HOST: mailhog
      SMTP_PORT: 1025
      SMTP_USER: ""
      SMTP_PASS: ""
      FROM_EMAIL: "dev@local.test"
      RATE_LIMIT_MAX: 10000
      AUTH_RATE_LIMIT_MAX: 1000
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
    command: node --watch src/server.js
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.runCommand('ping').ok"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --save "" --appendonly no
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI: http://localhost:8025

volumes:
  mongo_data:
```

### 11.2 Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

# Non-root user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S backend -u 1001
USER backend

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
```

### 11.3 Running Locally
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Seed database
docker-compose exec api node src/scripts/seed.js

# Stop all
docker-compose down

# Reset database (WARNING: destroys data)
docker-compose down -v
```

---

## Step 12: Monitoring & Observability

### 12.1 Winston Logger Config
```javascript
// backend/src/utils/logger.js
import winston from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.sssZ' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'sustainlocal-api' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024,   // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 20 * 1024 * 1024,   // 20MB
      maxFiles: 10,
    }),
  ],
});

// Pretty console logs in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(colorize(), simple())
  }));
}

// NEVER LOG: passwords, JWT tokens, Razorpay secrets, full card data
// ALWAYS LOG: userId, role, method, path, statusCode, duration_ms, ip
```

### 12.2 Request Logging Middleware
```javascript
// middleware/requestLog.middleware.js
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration_ms: Date.now() - start,
      userId: req.user?.id || 'anonymous',
      role: req.user?.role || 'guest',
      ip: req.ip?.replace(/^::ffff:/, ''),   // Anonymize IPv4-mapped IPv6
      userAgent: req.headers['user-agent'],
    });
  });
  next();
};
```

### 12.3 Uptime Monitoring
Use **BetterUptime** or **UptimeRobot** (free):
```
Monitor URL:      https://api.sustainlocal.in/api/health
Check interval:   5 minutes
Alert email:      admin@sustainlocal.in
Alert condition:  status !== 200
```

---

## 40-Step Production Launch Checklist

### Phase 1 — Provision External Services
```
[ ]  1. MongoDB Atlas M10 cluster created (ap-south-1)
[ ]  2. Upstash Redis created (ap-southeast-1, TLS enabled)
[ ]  3. Cloudinary account + upload preset "sustainlocal_products" (signed)
[ ]  4. Razorpay live mode activated + key_id / key_secret obtained
[ ]  5. Gmail App Password created (16-char)
[ ]  6. Sentry backend project DSN obtained
[ ]  7. Sentry frontend project DSN obtained
[ ]  8. Domain sustainlocal.in registered and DNS moved to Cloudflare
```

### Phase 2 — Backend Deploy
```
[ ]  9.  Render Web Service created (backend/ root, Node.js)
[ ] 10.  All backend env vars set in Render dashboard
[ ] 11.  Render static outbound IPs → added to MongoDB Atlas allowlist
[ ] 12.  First deploy triggered (check Render build logs — must show "Server running on port 5000")
[ ] 13.  Health check: GET https://api.sustainlocal.in/api/health → HTTP 200
         Response must show: { "checks": { "mongodb": "ok" } }
[ ] 14.  Seed database: node backend/src/scripts/seed.js (admin + test users + sample products)
[ ] 15.  Backend smoke test via curl or Postman:
         POST /api/auth/register → 201 ✅
         POST /api/auth/login    → 200 with token ✅
         GET  /api/products      → 200 with data ✅
```

### Phase 3 — Frontend Deploy
```
[ ] 16.  Vercel project created (frontend/ root, Vite preset)
[ ] 17.  All VITE_ env vars set in Vercel dashboard
[ ] 18.  vercel.json committed to frontend/ directory
[ ] 19.  First deploy triggered (check Vercel build logs — must show "Build completed")
[ ] 20.  Custom domain sustainlocal.in configured in Vercel
[ ] 21.  www.sustainlocal.in redirects to apex domain
[ ] 22.  HTTPS working: https://sustainlocal.in loads React app
[ ] 23.  Navigate directly to https://sustainlocal.in/products — loads (SPA routing works)
```

### Phase 4 — End-to-End Integration Tests
```
[ ] 24.  Buyer: register new account → email received ✅
[ ] 25.  Seller: register new account, create product (pending approval) ✅
[ ] 26.  Admin: login, go to /admin/moderation, approve product ✅
[ ] 27.  Buyer: product visible in catalog at /products ✅
[ ] 28.  Buyer: add product to cart → cart drawer shows item ✅
[ ] 29.  Buyer: checkout, fill address, click Pay Now ✅
[ ] 30.  Razorpay modal opens, use test card 4111 1111 1111 1111 → OTP "success" ✅
[ ] 31.  Order status → "paid", buyer sees confirmation ✅
[ ] 32.  Seller: order visible at /dashboard/orders ✅
[ ] 33.  Seller: update status → "shipped" with tracking number ✅
[ ] 34.  Buyer: in-app notification received ("Your order has shipped!") ✅
[ ] 35.  Real-time chat: buyer sends message to seller → delivered immediately ✅
[ ] 36.  Auction: buyer places bid, second browser shows updated bid via socket ✅
```

### Phase 5 — Production Hardening
```
[ ] 37.  Set AUTH_RATE_LIMIT_MAX=5 in Render env vars + redeploy
[ ] 38.  Logout test: copy JWT → logout → reuse JWT → 401 Unauthorized ✅
[ ] 39.  Intentionally trigger 500 → Sentry receives error alert ✅
[ ] 40.  Lighthouse audit: Performance > 85, Accessibility > 95, SEO > 90
         Run: npx lighthouse https://sustainlocal.in --view
```

---

## Rollback Strategy

### Backend Rollback
```bash
# Render dashboard → Deploys → click any previous deploy → Redeploy
# Or via API:
curl -X POST https://api.render.com/v1/services/<service_id>/deploys \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -d '{"clearCache": false}'
```

### Frontend Rollback
```bash
# Vercel dashboard → Deployments → select previous → Promote to Production
# Or via CLI:
vercel rollback <deployment-url>
```

### Database Rollback (Last Resort)
```
Atlas → Backup → Point-in-Time Restore
WARNING: This restores entire database. Coordinate with team.
Only use for data corruption, not for code bugs.
```

---

## Cost Estimate (Monthly, USD)

| Service | Tier | Cost |
|---|---|---|
| MongoDB Atlas | M10 Dedicated | $57 |
| Render | Standard ($25) or Starter ($7) | $7–25 |
| Upstash Redis | Pay-per-use (~10K req/day) | ~$2 |
| Cloudinary | Free tier (25GB storage, 25GB bandwidth) | $0 |
| Vercel | Free (Hobby) or Pro ($20) | $0–20 |
| Sentry | Free (5K errors/month) | $0 |
| Cloudflare | Free tier | $0 |
| Domain | sustainlocal.in | ~$15/year |
| Gmail SMTP | Free | $0 |
| **Total MVP** | | **~$66–102/month** |

Upgrade path: Render Standard → Atlas M20 → SendGrid when >1000 users.
