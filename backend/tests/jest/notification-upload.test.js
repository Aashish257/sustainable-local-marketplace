import request from "supertest";
import app from "../../src/app.js";
import { Notification } from "../../src/models/notification.model.js";
import { notifyUser } from "../../src/modules/notification/notification.service.js";
import { signParams } from "../../src/modules/upload/upload.service.js";
import { startDb, stopDb, clearDb, makeUser } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("FR-6 Notifications", () => {
    it("lists my notifications with an unread count", async () => {
        const me = await makeUser("buyer");
        await notifyUser(me.user._id, { type: "order", message: "one" });
        await notifyUser(me.user._id, { type: "order", message: "two" });
        const res = await request(app).get("/api/notifications").set(me.auth);
        expect(res.status).toBe(200);
        expect(res.body.data.items.map((n) => n.message)).toEqual(["two", "one"]);
        expect(res.body.data.unreadCount).toBe(2);
    });

    it("marks one and then all as read", async () => {
        const me = await makeUser("buyer");
        const n1 = await notifyUser(me.user._id, { message: "a" });
        await notifyUser(me.user._id, { message: "b" });
        await request(app).patch(`/api/notifications/${n1._id}/read`).set(me.auth).expect(200);
        expect((await request(app).get("/api/notifications").set(me.auth)).body.data.unreadCount).toBe(1);
        await request(app).patch("/api/notifications/read-all").set(me.auth).expect(200);
        expect((await request(app).get("/api/notifications").set(me.auth)).body.data.unreadCount).toBe(0);
    });

    it("does not let one user read or change another user's notifications", async () => {
        const [me, other] = [await makeUser("buyer"), await makeUser("buyer")];
        const n = await notifyUser(me.user._id, { message: "private" });
        expect((await request(app).get("/api/notifications").set(other.auth)).body.data.items).toHaveLength(0);
        expect((await request(app).patch(`/api/notifications/${n._id}/read`).set(other.auth)).status).toBe(404);
    });

    it("validates the id, requires login, and clears all", async () => {
        const me = await makeUser("buyer");
        await notifyUser(me.user._id, { message: "x" });
        expect((await request(app).patch("/api/notifications/abc/read").set(me.auth)).status).toBe(400);
        expect((await request(app).get("/api/notifications")).status).toBe(401);
        await request(app).delete("/api/notifications").set(me.auth).expect(200);
        expect(await Notification.countDocuments()).toBe(0);
    });

    it("never throws, even with bad input (must not break orders or bids)", async () => {
        await expect(notifyUser(null, { message: "x" })).resolves.toBeNull();
        await expect(notifyUser("not-an-id", { message: "x" })).resolves.toBeNull();
    });
});

describe("FR-2.4 Image upload signature", () => {
    it("matches Cloudinary's documented signature example", () => {
        expect(signParams({ timestamp: 1315060510, public_id: "sample_image" }, "abcd")).toBe("b4ad47fb4e25c7bf5f92a20089f9db59bc302313");
    });

    it("returns 503 when Cloudinary is not configured", async () => {
        const seller = await makeUser("seller");
        expect((await request(app).post("/api/uploads/signature").set(seller.auth)).status).toBe(503);
    });

    it("signs uploads for sellers only, into their own folder, without leaking the secret", async () => {
        Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: "demo", CLOUDINARY_API_KEY: "key", CLOUDINARY_API_SECRET: "sek" });
        try {
            const buyer = await makeUser("buyer");
            const seller = await makeUser("seller");
            expect((await request(app).post("/api/uploads/signature").set(buyer.auth)).status).toBe(403);

            const res = await request(app).post("/api/uploads/signature").set(seller.auth);
            expect(res.status).toBe(200);
            const d = res.body.data;
            expect(d.folder).toBe(`products/${seller.user._id}`);
            expect(d.signature).toBe(signParams({ folder: d.folder, timestamp: d.timestamp }, "sek"));
            expect(JSON.stringify(res.body)).not.toContain("sek");
        } finally {
            delete process.env.CLOUDINARY_CLOUD_NAME;
            delete process.env.CLOUDINARY_API_KEY;
            delete process.env.CLOUDINARY_API_SECRET;
        }
    });
});
