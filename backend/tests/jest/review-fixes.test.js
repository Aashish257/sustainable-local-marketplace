// Regression tests for bugs found in the review pass (2026-10-20).
import request from "supertest";
import app from "../../src/app.js";
import { Order } from "../../src/models/order.model.js";
import { Product } from "../../src/models/product.model.js";
import { verifyPaymentService } from "../../src/modules/payment/payment.service.js";
import { startDb, stopDb, clearDb, makeUser, makeProduct } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

const mockPay = (orderId) => ({ orderId: orderId.toString(), razorpay_order_id: "order_test_1", razorpay_payment_id: "pay_test_1", razorpay_signature: "mock_1" });

describe("Bug 1: quantities are validated", () => {
    it.each([-5, 0, 1.5, 101])("cart rejects quantity %p", async (quantity) => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id);
        expect((await request(app).post("/api/cart").set(buyer.auth).send({ productId: p._id.toString(), quantity })).status).toBe(400);
    });

    it("direct order items with a negative quantity are rejected (no negative totals)", async () => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id);
        const res = await request(app).post("/api/orders").set(buyer.auth).send({ items: [{ productId: p._id, quantity: -5 }] });
        expect(res.status).toBe(400);
        expect(await Order.countDocuments()).toBe(0);
    });
});

describe("Bug 2: buyers can only pay for their own orders", () => {
    it("blocks creating or verifying payment for another buyer's order", async () => {
        const seller = await makeUser("seller");
        const owner = await makeUser("buyer");
        const thief = await makeUser("buyer");
        const p = await makeProduct(seller.user._id);
        const o = await Order.create({ buyerId: owner.user._id, items: [{ productId: p._id, quantity: 1, price: 100 }], totalAmount: 100 });

        expect((await request(app).post("/api/payments/create").set(thief.auth).send({ orderId: o._id.toString() })).status).toBe(403);
        expect((await request(app).post("/api/payments/verify").set(thief.auth).send(mockPay(o._id))).status).toBe(403);
        expect((await Order.findById(o._id)).status).toBe("pending");
        expect((await request(app).post("/api/payments/verify").set(owner.auth).send(mockPay(o._id))).status).toBe(200);
    });
});

describe("Bug 3: concurrent verify of the same order", () => {
    it("processes the order once and takes stock once", async () => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id, { stock: 5 });
        const o = await Order.create({ buyerId: buyer.user._id, items: [{ productId: p._id, quantity: 1, price: 100 }], totalAmount: 100 });

        const results = await Promise.allSettled(Array.from({ length: 5 }, () => verifyPaymentService(mockPay(o._id))));
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
        expect((await Product.findById(p._id)).stock).toBe(4);
    });
});

describe("Bug 4: order status follows allowed transitions", () => {
    const setup = async (status) => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id, { stock: 3 });
        const o = await Order.create({ buyerId: buyer.user._id, status, items: [{ productId: p._id, quantity: 2, price: 100 }], totalAmount: 200 });
        const patch = (s) => request(app).patch(`/api/orders/${o._id}/status`).set(seller.auth).send({ status: s });
        return { o, p, patch };
    };

    it("does not let a seller mark an unpaid order as paid or shipped", async () => {
        const { patch } = await setup("pending");
        expect((await patch("paid")).status).toBe(409);
        expect((await patch("shipped")).status).toBe(409);
    });

    it("does not let a delivered order go backwards", async () => {
        const { patch } = await setup("delivered");
        expect((await patch("pending")).status).toBe(409);
    });

    it("walks the happy path paid -> shipped -> delivered", async () => {
        const { patch } = await setup("paid");
        expect((await patch("shipped")).status).toBe(200);
        expect((await patch("delivered")).status).toBe(200);
    });

    it("cancelling a paid order restores stock and requests a refund", async () => {
        const { o, p, patch } = await setup("paid");
        expect((await patch("cancelled")).status).toBe(200);
        expect((await Product.findById(p._id)).stock).toBe(5);
        expect((await Order.findById(o._id)).refundStatus).toBe("requested");
    });
});

describe("Bug 5: hidden products cannot be ordered", () => {
    it.each([{ isApproved: false }, { isActive: false }])("rejects ordering a product with %p", async (extra) => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const p = await makeProduct(seller.user._id, extra);
        const res = await request(app).post("/api/orders").set(buyer.auth).send({ items: [{ productId: p._id, quantity: 1 }] });
        expect(res.status).toBe(400);
    });
});

describe("Bug 6: readable validation errors", () => {
    it("register without consent returns a plain message, not raw JSON", async () => {
        const res = await request(app).post("/api/auth/register").send({ name: "Asha", email: "a@test.com", password: "secret123" });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("You must accept the privacy policy to register");
    });
});
