import request from "supertest";
import app from "../../src/app.js";
import User from "../../src/models/user.model.js";
import { Product } from "../../src/models/product.model.js";
import { Order } from "../../src/models/order.model.js";
import { placeBid, closeExpiredAuctions } from "../../src/modules/bid/bid.service.js";
import { startDb, stopDb, clearDb, makeUser, makeProduct } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

const signup = async (role = "buyer") => {
    const body = { name: "Real User", email: `${role}${Date.now()}${Math.random()}@test.com`, password: "secret123", role, consent: true };
    await request(app).post("/api/auth/register").send(body);
    const login = await request(app).post("/api/auth/login").send({ email: body.email, password: body.password });
    return { email: body.email, password: body.password, auth: { Authorization: `Bearer ${login.body.data.token}` } };
};

describe("FR-1.4 Logout revokes tokens", () => {
    it("rejects the old token after logout, and a fresh login works", async () => {
        const u = await signup();
        expect((await request(app).get("/api/auth/me").set(u.auth)).status).toBe(200);
        expect((await request(app).post("/api/auth/logout").set(u.auth)).status).toBe(200);
        expect((await request(app).get("/api/auth/me").set(u.auth)).status).toBe(401);

        const again = await request(app).post("/api/auth/login").send({ email: u.email, password: u.password });
        const fresh = { Authorization: `Bearer ${again.body.data.token}` };
        expect((await request(app).get("/api/auth/me").set(fresh)).status).toBe(200);
    });

    it("applies a role change immediately (role is read from the DB, not the old token)", async () => {
        const admin = await makeUser("admin");
        const u = await makeUser("buyer");
        await request(app).patch(`/api/admin/users/${u.user._id}/role`).set(admin.auth).send({ role: "seller" });
        expect((await request(app).get("/api/auth/me").set(u.auth)).body.data.role).toBe("seller");
    });
});

describe("FR-8.2 Admin suspends users", () => {
    it("suspension blocks existing tokens and new logins; reactivation restores login", async () => {
        const admin = await makeUser("admin");
        const u = await signup();
        const userId = (await User.findOne({ email: u.email }))._id;

        expect((await request(app).patch(`/api/admin/users/${userId}/status`).set(admin.auth).send({ active: false })).status).toBe(200);
        expect((await request(app).get("/api/auth/me").set(u.auth)).status).toBe(401);
        expect((await request(app).post("/api/auth/login").send({ email: u.email, password: u.password })).status).toBe(403);

        await request(app).patch(`/api/admin/users/${userId}/status`).set(admin.auth).send({ active: true }).expect(200);
        expect((await request(app).post("/api/auth/login").send({ email: u.email, password: u.password })).status).toBe(200);
    });

    it("validates input, blocks self-suspension and non-admins", async () => {
        const admin = await makeUser("admin");
        const u = await makeUser("buyer");
        expect((await request(app).patch(`/api/admin/users/${u.user._id}/status`).set(admin.auth).send({ active: "no" })).status).toBe(400);
        expect((await request(app).patch(`/api/admin/users/${admin.user._id}/status`).set(admin.auth).send({ active: false })).status).toBe(400);
        expect((await request(app).patch(`/api/admin/users/${admin.user._id}/status`).set(u.auth).send({ active: false })).status).toBe(403);
    });
});

describe("FR-4.5 Auction winner checkout", () => {
    const closedAuction = async () => {
        const seller = await makeUser("seller");
        const winner = await makeUser("buyer");
        const loser = await makeUser("buyer");
        const p = await makeProduct(seller.user._id, { biddingEnabled: true, biddingStartingPrice: 100, biddingEndTime: new Date(Date.now() + 300) });
        await placeBid({ productId: p._id, userId: loser.user._id, amount: 150 });
        await placeBid({ productId: p._id, userId: winner.user._id, amount: 400 });
        await new Promise((r) => setTimeout(r, 400));
        await closeExpiredAuctions();
        return { p, winner, loser };
    };

    it("creates one order at the winning price and pays it", async () => {
        const { p, winner } = await closedAuction();
        const first = await request(app).post(`/api/orders/auction/${p._id}`).set(winner.auth);
        expect(first.status).toBe(201);
        expect(first.body.data).toMatchObject({ totalAmount: 400, source: "auction", status: "pending" });

        const again = await request(app).post(`/api/orders/auction/${p._id}`).set(winner.auth);
        expect(again.body.data._id).toBe(first.body.data._id); // double-click safe

        const pay = await request(app).post("/api/payments/verify").set(winner.auth).send({
            orderId: first.body.data._id, razorpay_order_id: "order_test_1", razorpay_payment_id: "pay_test_1", razorpay_signature: "mock_1",
        });
        expect(pay.status).toBe(200);
        expect((await Product.findById(p._id)).stock).toBe(4);
    });

    it("only the winner can check out, and only after the auction closes", async () => {
        const { p, loser } = await closedAuction();
        expect((await request(app).post(`/api/orders/auction/${p._id}`).set(loser.auth)).status).toBe(403);

        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const running = await makeProduct(seller.user._id, { biddingEnabled: true, biddingEndTime: new Date(Date.now() + 60000) });
        expect((await request(app).post(`/api/orders/auction/${running._id}`).set(buyer.auth)).status).toBe(409);
        expect((await request(app).post("/api/orders/auction/abc").set(buyer.auth)).status).toBe(400);
    });

    it("auction items cannot be bought at list price through the cart", async () => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id, { biddingEnabled: true });
        const res = await request(app).post("/api/orders").set(buyer.auth).send({ items: [{ productId: p._id, quantity: 1 }] });
        expect(res.status).toBe(400);
        expect(await Order.countDocuments()).toBe(0);
    });
});

describe("FR-2.5 Edits and moderation", () => {
    it("sends a listing back to moderation when its content changes", async () => {
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id);
        const res = await request(app).put(`/api/products/${p._id}`).set(seller.auth).send({ title: "New shiny title" });
        expect(res.status).toBe(200);
        expect(res.body.data.isApproved).toBe(false);
    });

    it("keeps approval for price/stock changes and for re-sending unchanged fields", async () => {
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id);
        const res = await request(app).put(`/api/products/${p._id}`).set(seller.auth)
            .send({ title: p.title, description: p.description, price: 999, stock: 2 });
        expect(res.body.data.isApproved).toBe(true);
        expect(res.body.data.price).toBe(999);
    });

    it("ignores fields sellers must not set (no self-approval, no fake bids)", async () => {
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id, { isApproved: false });
        await request(app).put(`/api/products/${p._id}`).set(seller.auth).send({ isApproved: true, currentBid: 5, price: 50 });
        const after = await Product.findById(p._id);
        expect(after.isApproved).toBe(false);
        expect(after.currentBid).toBeNull();
        expect(after.price).toBe(50);
    });

    it("locks auction settings once bidding has started", async () => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id, { biddingEnabled: true, biddingStartingPrice: 100 });
        await placeBid({ productId: p._id, userId: buyer.user._id, amount: 150 });
        const blocked = await request(app).put(`/api/products/${p._id}`).set(seller.auth).send({ biddingStartingPrice: 10 });
        expect(blocked.status).toBe(409);
        const unchanged = await request(app).put(`/api/products/${p._id}`).set(seller.auth).send({ biddingEnabled: true, stock: 3 });
        expect(unchanged.status).toBe(200);
    });
});
