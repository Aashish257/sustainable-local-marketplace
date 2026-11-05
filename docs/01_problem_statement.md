# 🌿 Document 1: Problem Statement & Project Scope

## 1. Business Context
In recent years, the demand for sustainable, locally sourced products has grown significantly. Consumers are increasingly aware of their carbon footprint, chemical exposure, and the socio-economic impacts of their purchasing decisions. At the same time, local small-scale producers—farmers, artisans, and boutique sustainable brands—are producing high-quality eco-friendly goods but lack the digital infrastructure and visibility to reach this growing consumer base directly.

---

## 2. Problem Definition
The "Sustainable Local Marketplace" solves three critical friction points in the current retail and e-commerce ecosystem:

1. **Market Fragmentation & Discovery Bar**: Local sustainable producers lack a centralized, high-visibility platform to list their goods. Eco-conscious buyers struggle to find verified local vendors, resorting to standard commercial platforms where "greenwashing" is prevalent.
2. **Opacity in Ecological Impact**: Traditional marketplaces do not present standardized, quantitative sustainability metrics. Consumers must read long labels or trust marketing claims without objective scoring of water usage, carbon emissions, local sourcing, or packaging waste.
3. **Lack of Trust and Community Engagement**: Buyers hesitate to purchase from small, independent local sellers due to doubts about authenticity, transaction security, and delivery. Furthermore, the lack of real-time communication tools limits direct relationship-building.

---

## 3. Core Objectives
The platform aims to bridge these gaps through the following objectives:
- **Direct Marketplace Match**: Connect local sustainable sellers and eco-conscious buyers directly, eliminating intermediaries and lowering transaction fees.
- **Quantitative Sustainability Transparency**: Standardize sustainability evaluations through a 0-10 rating system, integrating ecological criteria directly into the product catalog.
- **High-Trust Interaction Loop**: Provide integrated, real-time messaging and live-bidding tools to establish community and transparency.
- **Secure Transaction & Order Loop**: Integrate reliable payment gateways (Razorpay) with atomic inventory management to ensure purchase safety.

---

## 4. Target User Personas
The system serves three primary user roles:

```
                  ┌───────────────┐
                  │  Marketplace  │
                  └───────┬───────┘
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │   Buyer   │    │  Seller   │    │   Admin   │
   └───────────┘    └───────────┘    └───────────┘
```

### A. The Eco-Conscious Buyer
- **Description**: Consumers seeking green, local, and low-impact products.
- **Needs**: Easy product discovery, transparent ecological ratings, secure payments, and a way to verify seller credentials.
- **Use Cases**: Search catalog, browse sustainability categories, chat with sellers, place bids on unique/rare local goods, make purchases, and track orders.

### B. The Local Sustainable Seller
- **Description**: Farmers, craftspeople, and local cooperatives.
- **Needs**: Easy listing management, transparent billing, marketing tools, and ways to build direct relationships with consumers.
- **Use Cases**: List products, input sustainability metrics, run live auctions/bidding, chat with potential buyers, and process orders.

### C. The Platform Administrator
- **Description**: System operators who manage platform integrity.
- **Needs**: Global system overview, user verification tools, audit logs, and conflict resolution mechanisms.
- **Use Cases**: Moderate listings, review disputed transactions, monitor database health, and view system metrics (revenue, user sign-ups).

---

## 5. Project Scope

### In-Scope Features
1. **User Management & Auth**: RBAC (Buyer, Seller, Admin) authentication with secure JWT tokens.
2. **Product Catalog**: Multi-category, paginated product catalog featuring a 0-10 sustainability score.
3. **Real-Time Interactive Bidding**: WebSockets-based live auctions for artisanal or limited-run products.
4. **Direct Chat System**: Real-time Socket.io chat between buyers and sellers with typing indicators.
5. **Secure Order Checkout**: Integrations with Razorpay gateway, supporting signature verification and atomic inventory updates.
6. **Background Tasks & Notifications**: Redis-backed BullMQ processing for transactional emails and bid notifications.
7. **Premium Responsive UI**: Glassmorphic front-end theme with customizable Dark/Light mode and WebGL/Three.js interactive leaf graphics.

### Out-of-Scope (Future Phases)
1. **Automated Logistics**: Auto-dispatch and integration with third-party logistics API (e.g., Shiprocket) are deferred; fulfillment tracking is input manually by sellers.
2. **AI Sustainability Verification**: Automated scraping or satellite imaging to verify seller farm sustainability claims; currently relies on self-reported inputs verified manually by administrators.
3. **Multi-Currency Settlement**: Support for international sales; currently optimized strictly for domestic Indian local commerce (INR).

---

## 6. Key Performance Indicators (KPIs)
To measure the success of the platform, the following metrics will be tracked:
- **Product Eco-Transparency**: 100% of products listed must have a verified sustainability rating.
- **Real-Time Responsiveness**: Chat messages and bidding updates must deliver with a latency of less than 200ms.
- **Transaction Reliability**: Zero database discrepancies in inventory checks during simultaneous checkout attempts (atomic concurrency).
- **Graceful Performance**: Core application API remains online and functional (degrades gracefully to memory sockets and database lookups) even if Redis goes offline.
