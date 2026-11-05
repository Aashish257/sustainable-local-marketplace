// API server for Playwright E2E tests: the real app on a throwaway in-memory MongoDB
// with known users and products. Never touches the development database.
// Started automatically by frontend/playwright.config.js (or: node tests/e2e-server.js).

// Env must be set before the app modules load (some read it at import time)
process.env.NODE_ENV = "development"; // allows sandbox (mock) payments
process.env.DISABLE_REDIS = "true";
process.env.JWT_SECRET = process.env.JWT_SECRET || "e2e-secret";
process.env.RAZORPAY_KEY_ID = "rzp_test_dummy";
process.env.AUCTION_SWEEP_MS = "1000";
process.env.BCRYPT_ROUNDS = "4";
delete process.env.CLIENT_URL; // dev CORS = "*"

const PORT = Number(process.env.E2E_API_PORT) || 5100;

const http = await import("http");
const mongoose = (await import("mongoose")).default;
const { MongoMemoryServer } = await import("mongodb-memory-server");
const { default: app } = await import("../src/app.js");
const { initSocket } = await import("../src/socket/index.js");
const { startAuctionScheduler } = await import("../src/jobs/auction.scheduler.js");
const { default: User } = await import("../src/models/user.model.js");
const { Product } = await import("../src/models/product.model.js");
const { hashPassword } = await import("../src/utils/hash.js");

const mongod = await MongoMemoryServer.create();
await mongoose.connect(mongod.getUri());

// ---- Known test data (all passwords: password123) ----
const password = await hashPassword("password123");
const mk = (name, email, role) => User.create({ name, email, password, role, consentGiven: true, consentAt: new Date() });
const [, , seller] = await Promise.all([
    mk("Bina Buyer", "buyer@e2e.test", "buyer"),
    mk("Rohan Rival", "buyer2@e2e.test", "buyer"),
    mk("Sita Seller", "seller@e2e.test", "seller"),
    mk("Arun Admin", "admin@e2e.test", "admin"),
]);
await Product.create([
    {
        title: "E2E Bamboo Bottle", description: "Reusable bamboo bottle for the buy flow test",
        price: 500, stock: 5, category: "Zero Waste", sustainabilityScore: 8, sellerId: seller._id, isApproved: true,
    },
    {
        title: "E2E Vintage Lamp", description: "One-of-a-kind lamp for the bidding flow test",
        price: 1000, stock: 1, category: "Upcycled Goods", sustainabilityScore: 7, sellerId: seller._id, isApproved: true,
        biddingEnabled: true, biddingStartingPrice: 1000, biddingEndTime: new Date(Date.now() + 30 * 60 * 1000),
    },
]);

const server = http.createServer(app);
initSocket(server);
startAuctionScheduler();
server.listen(PORT, () => console.log(`E2E API ready on http://localhost:${PORT}`));

const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
