import request from "supertest";
import app from "../../src/app.js";
import { Order } from "../../src/models/order.model.js";
import { Product } from "../../src/models/product.model.js";
import User from "../../src/models/user.model.js";
import { runAuctionSweep } from "../../src/jobs/auction.scheduler.js";
import { startDb, stopDb, clearDb, makeUser, makeProduct } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("FR-5 Reviews (verified purchase)", () => {
    it("blocks reviews from buyers who have not purchased", async () => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id);
        const res = await request(app).post("/api/reviews").set(buyer.auth).send({ productId: p._id.toString(), rating: 5, comment: "Great product overall" });
        expect(res.status).toBe(403);
    });

    it("accepts one review after purchase, updates the rating, and blocks a second", async () => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id);
        await Order.create({ buyerId: buyer.user._id, status: "delivered", items: [{ productId: p._id, quantity: 1, price: 100 }], totalAmount: 100 });

        const review = { productId: p._id.toString(), rating: 4, comment: "Lasted well, recommend" };
        expect((await request(app).post("/api/reviews").set(buyer.auth).send(review)).status).toBe(201);
        expect((await request(app).post("/api/reviews").set(buyer.auth).send(review)).status).toBe(403);

        const updated = await Product.findById(p._id);
        expect(updated.averageRating).toBe(4);
        expect(updated.totalReviews).toBe(1);
        const list = await request(app).get(`/api/reviews/${p._id}`);
        expect(list.status).toBe(200);
    });
});

describe("FR-3.0 Cart", () => {
    it("adds, reads and removes items (buyers only)", async () => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id);

        expect((await request(app).post("/api/cart").set(seller.auth).send({ productId: p._id, quantity: 1 })).status).toBe(403);
        await request(app).post("/api/cart").set(buyer.auth).send({ productId: p._id, quantity: 2 });
        const cart = await request(app).get("/api/cart").set(buyer.auth);
        expect(cart.status).toBe(200);
        expect(JSON.stringify(cart.body)).toContain(p._id.toString());

        const removed = await request(app).delete(`/api/cart/${p._id}`).set(buyer.auth);
        expect(removed.status).toBeLessThan(300);
    });
});

describe("FR-7 Messages (REST)", () => {
    it("sends a message and returns history and conversations", async () => {
        const [a, b] = [await makeUser("buyer"), await makeUser("seller")];
        expect((await request(app).post("/api/messages").set(a.auth).send({})).status).toBe(400);
        const sent = await request(app).post("/api/messages").set(a.auth).send({ receiverId: b.user._id.toString(), message: "Is this in stock?" });
        expect(sent.status).toBe(201);

        const history = await request(app).get(`/api/messages/${b.user._id}`).set(a.auth);
        expect(history.status).toBe(200);
        expect(JSON.stringify(history.body)).toContain("Is this in stock?");
        expect((await request(app).get("/api/messages/threads").set(b.auth)).status).toBe(200);
    });
});

describe("FR-8 Admin", () => {
    it("returns stats, users, products and orders to admins", async () => {
        const admin = await makeUser("admin");
        for (const path of ["stats", "users", "products", "orders"]) {
            expect((await request(app).get(`/api/admin/${path}`).set(admin.auth)).status).toBe(200);
        }
    });

    it("changes roles but never lets an admin demote or delete themselves", async () => {
        const admin = await makeUser("admin");
        const user = await makeUser("buyer");
        expect((await request(app).patch(`/api/admin/users/${user.user._id}/role`).set(admin.auth).send({ role: "wizard" })).status).toBe(400);
        expect((await request(app).patch(`/api/admin/users/${user.user._id}/role`).set(admin.auth).send({ role: "seller" })).status).toBe(200);
        expect((await User.findById(user.user._id)).role).toBe("seller");
        expect((await request(app).patch(`/api/admin/users/${admin.user._id}/role`).set(admin.auth).send({ role: "buyer" })).status).toBe(400);
        expect((await request(app).delete(`/api/admin/users/${admin.user._id}`).set(admin.auth)).status).toBe(400);
        expect((await request(app).delete(`/api/admin/users/${user.user._id}`).set(admin.auth)).status).toBe(200);
    });

    it("lets admins update order status and delete products", async () => {
        const admin = await makeUser("admin");
        const buyer = await makeUser("buyer");
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id);
        const o = await Order.create({ buyerId: buyer.user._id, status: "paid", items: [{ productId: p._id, quantity: 1, price: 100 }], totalAmount: 100 });
        expect((await request(app).patch(`/api/admin/orders/${o._id}/status`).set(admin.auth).send({ status: "delivered" })).status).toBe(200);
        expect((await request(app).delete(`/api/admin/products/${p._id}`).set(admin.auth)).status).toBe(200);
        expect((await request(app).delete(`/api/admin/products/${p._id}`).set(admin.auth)).status).toBe(404);
    });
});

describe("FR-4.4 Auction sweep job", () => {
    it("closes due auctions and survives without a socket server", async () => {
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id, { biddingEnabled: true, biddingEndTime: new Date(Date.now() - 1000) });
        await runAuctionSweep(); // getIO() is not initialised in tests: must not throw
        expect((await Product.findById(p._id)).auctionClosed).toBe(true);
    });
});
