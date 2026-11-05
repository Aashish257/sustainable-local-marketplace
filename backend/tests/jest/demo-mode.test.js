import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import User from "../../src/models/user.model.js";
import { Product } from "../../src/models/product.model.js";
import { Order } from "../../src/models/order.model.js";
import { Review } from "../../src/models/review.model.js";
import { resetDemoData, DEMO_PRODUCTS, DEMO_USERS } from "../../src/scripts/demo-data.js";
import { startDb, stopDb, clearDb, makeUser, makeProduct } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

// The public demo shows the admin login, so a demo admin may look but not change anything
const makeDemo = async (role) => {
    const u = await makeUser(role);
    await User.updateOne({ _id: u.user._id }, { isDemo: true });
    return u;
};

describe("Public demo accounts", () => {
    it("demo admin can read stats", async () => {
        const admin = await makeDemo("admin");
        const res = await request(app).get("/api/admin/stats").set(admin.auth);
        expect(res.status).toBe(200);
    });

    it("demo admin cannot change a role", async () => {
        const admin = await makeDemo("admin");
        const target = await makeUser("buyer");
        const res = await request(app).patch(`/api/admin/users/${target.user._id}/role`).set(admin.auth).send({ role: "seller" });
        expect(res.status).toBe(403);
        expect(JSON.stringify(res.body)).toContain("disabled in the public demo");
        expect((await User.findById(target.user._id)).role).toBe("buyer");
    });

    it("demo admin cannot delete a user", async () => {
        const admin = await makeDemo("admin");
        const target = await makeUser("buyer");
        const res = await request(app).delete(`/api/admin/users/${target.user._id}`).set(admin.auth);
        expect(res.status).toBe(403);
        expect(await User.findById(target.user._id)).not.toBeNull();
    });

    it("demo admin cannot change product approval", async () => {
        const admin = await makeDemo("admin");
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id);
        const res = await request(app).patch(`/api/admin/products/${p._id}/approval`).set(admin.auth).send({ approved: false });
        expect(res.status).toBe(403);
    });

    it("real admin still can change a role", async () => {
        const admin = await makeUser("admin");
        const target = await makeUser("buyer");
        const res = await request(app).patch(`/api/admin/users/${target.user._id}/role`).set(admin.auth).send({ role: "seller" });
        expect(res.status).toBe(200);
    });

    it("demo flag comes from the database, not the token", async () => {
        const admin = await makeDemo("admin");
        const token = jwt.sign({ id: admin.user._id.toString(), role: "admin" }, process.env.JWT_SECRET);
        const target = await makeUser("buyer");
        const res = await request(app).patch(`/api/admin/users/${target.user._id}/role`)
            .set({ Authorization: `Bearer ${token}` }).send({ role: "seller" });
        expect(res.status).toBe(403);
    });

    it("demo seller can still create a product", async () => {
        const seller = await makeDemo("seller");
        const res = await request(app).post("/api/products").set(seller.auth)
            .send({ title: "Demo Jute Bag", description: "Handwoven jute shopping bag", price: 250, category: "Zero Waste", stock: 3 });
        expect(res.status).toBe(201);
    });

    it("demo admin cannot change order status through the orders route", async () => {
        const admin = await makeDemo("admin");
        const buyer = await makeUser("buyer");
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id);
        const o = await Order.create({ buyerId: buyer.user._id, status: "paid", items: [{ productId: p._id, quantity: 1, price: 100 }], totalAmount: 100 });
        const res = await request(app).patch(`/api/orders/${o._id}/status`).set(admin.auth).send({ status: "cancelled" });
        expect(res.status).toBe(403);
        expect((await Order.findById(o._id)).status).toBe("paid");
    });

    it("demo admin cannot request upload signatures", async () => {
        const admin = await makeDemo("admin");
        const res = await request(app).post("/api/uploads/signature").set(admin.auth).send({});
        expect(res.status).toBe(403);
    });

    it("demo admin can still log out", async () => {
        const admin = await makeDemo("admin");
        const res = await request(app).post("/api/auth/logout").set(admin.auth);
        expect(res.status).toBe(200);
    });

    it("logging out of a shared demo account does not sign out other people using it", async () => {
        const buyer = await makeDemo("buyer");
        const otherVisitor = { Authorization: buyer.auth.Authorization }; // same shared account, another browser
        expect((await request(app).post("/api/auth/logout").set(buyer.auth)).status).toBe(200);
        expect((await request(app).get("/api/auth/me").set(otherVisitor)).status).toBe(200);
    });
});

describe("Demo data reset", () => {
    it("restores demo accounts and products, and leaves real accounts alone", async () => {
        await resetDemoData();
        const owner = await makeUser("admin"); // the owner's private admin
        const realSeller = await makeUser("seller");
        const realProduct = await makeProduct(realSeller.user._id, { title: "Real Seller Product" });

        // a visitor vandalises the demo
        const demoSeller = await User.findOne({ email: DEMO_USERS.seller.email });
        const demoBuyer = await User.findOne({ email: DEMO_USERS.buyer.email });
        const demoProduct = await Product.findOne({ sellerId: demoSeller._id });
        await Product.updateOne({ _id: demoProduct._id }, { title: "Rude title" });
        await Review.create({ userId: demoBuyer._id, productId: demoProduct._id, rating: 1, comment: "spam spam spam" });

        await resetDemoData();

        expect(await User.findById(owner.user._id)).not.toBeNull();
        expect(await Product.findById(realProduct._id)).not.toBeNull();
        const seller = await User.findOne({ email: DEMO_USERS.seller.email });
        const titles = (await Product.find({ sellerId: seller._id })).map((p) => p.title).sort();
        expect(titles).toEqual(DEMO_PRODUCTS.map((p) => p.title).sort());
        expect(await Review.countDocuments({ comment: "spam spam spam" })).toBe(0);
        expect(await User.countDocuments({ isDemo: true })).toBe(3);
    });
});
