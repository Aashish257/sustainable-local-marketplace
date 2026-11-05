import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app.js";
import User from "../../src/models/user.model.js";
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
});
