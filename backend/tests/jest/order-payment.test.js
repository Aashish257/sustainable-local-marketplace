import request from "supertest";
import crypto from "crypto";
import app from "../../src/app.js";
import { Order } from "../../src/models/order.model.js";
import { Product } from "../../src/models/product.model.js";
import { verifyPaymentService } from "../../src/modules/payment/payment.service.js";
import { startDb, stopDb, clearDb, makeUser, makeProduct } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

const mockPay = (orderId) => ({ orderId: orderId.toString(), razorpay_order_id: "order_test_1", razorpay_payment_id: "pay_test_1", razorpay_signature: "mock_1" });
const order = (buyerId, productId, quantity = 1) =>
    Order.create({ buyerId, items: [{ productId, quantity, price: 100 }], totalAmount: 100 * quantity });

describe("FR-3.1 Checkout from cart", () => {
    it("creates an order with a server-side total from the cart", async () => {
        const buyer = await makeUser("buyer");
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id, { price: 250 });

        expect((await request(app).post("/api/cart").set(buyer.auth).send({ productId: p._id, quantity: 2 })).status).toBeLessThan(300);
        const res = await request(app).post("/api/orders").set(buyer.auth).send({});
        expect(res.status).toBe(201);
        expect(res.body.data.totalAmount).toBe(500);
        expect(res.body.data.status).toBe("pending");

        const mine = await request(app).get("/api/orders/my").set(buyer.auth);
        expect(mine.body.data).toHaveLength(1);
    });

    it("creates a (test-mode) Razorpay order for a pending order", async () => {
        const buyer = await makeUser("buyer");
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id);
        const o = await order(buyer.user._id, p._id);
        const res = await request(app).post("/api/payments/create").set(buyer.auth).send({ orderId: o._id.toString() });
        expect(res.status).toBe(200);
        expect(res.body.data.amount).toBe(10000); // ₹100 in paise
    });
});

describe("FR-3.2 Payment verification", () => {
    it("marks the order paid and reduces stock", async () => {
        const buyer = await makeUser("buyer");
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id, { stock: 3 });
        const o = await order(buyer.user._id, p._id, 2);

        const res = await request(app).post("/api/payments/verify").set(buyer.auth).send(mockPay(o._id));
        expect(res.status).toBe(200);
        expect((await Order.findById(o._id)).status).toBe("paid");
        expect((await Product.findById(p._id)).stock).toBe(1);
    });

    it("returns 409 when the same order is verified twice (idempotency)", async () => {
        const buyer = await makeUser("buyer");
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id);
        const o = await order(buyer.user._id, p._id);
        await request(app).post("/api/payments/verify").set(buyer.auth).send(mockPay(o._id));
        const again = await request(app).post("/api/payments/verify").set(buyer.auth).send(mockPay(o._id));
        expect(again.status).toBe(409);
        expect((await Product.findById(p._id)).stock).toBe(4);
    });

    it("never oversells: 2 buyers, 1 in stock -> 1 paid, 1 cancelled for refund", async () => {
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id, { stock: 1 });
        const a = await order((await makeUser("buyer")).user._id, p._id);
        const b = await order((await makeUser("buyer")).user._id, p._id);

        const results = await Promise.allSettled([verifyPaymentService(mockPay(a._id)), verifyPaymentService(mockPay(b._id))]);
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
        expect(results.find((r) => r.status === "rejected").reason.status).toBe(409);

        const statuses = (await Order.find({ _id: { $in: [a._id, b._id] } })).map((o) => o.status).sort();
        expect(statuses).toEqual(["cancelled", "paid"]);
        expect(await Order.findOne({ status: "cancelled" })).toMatchObject({ refundStatus: "requested" });
        expect((await Product.findById(p._id)).stock).toBe(0);
    });

    it("rolls back stock already taken when a later item is sold out", async () => {
        const seller = await makeUser("seller");
        const buyer = await makeUser("buyer");
        const inStock = await makeProduct(seller.user._id, { stock: 5 });
        const soldOut = await makeProduct(seller.user._id, { stock: 0 });
        const o = await Order.create({
            buyerId: buyer.user._id, totalAmount: 200,
            items: [{ productId: inStock._id, quantity: 1, price: 100 }, { productId: soldOut._id, quantity: 1, price: 100 }],
        });
        await expect(verifyPaymentService(mockPay(o._id))).rejects.toMatchObject({ status: 409 });
        expect((await Product.findById(inStock._id)).stock).toBe(5);
    });
});

describe("NFR-SEC Payment signature in production", () => {
    const saved = { ...process.env };
    beforeEach(() => {
        process.env.NODE_ENV = "production";
        process.env.RAZORPAY_KEY_ID = "rzp_test_realLooking";
        process.env.RAZORPAY_KEY_SECRET = "prod_secret";
    });
    afterEach(() => Object.assign(process.env, saved));

    const verify = (sig) => verifyPaymentService({ razorpay_order_id: "order_ABC", razorpay_payment_id: "pay_1", razorpay_signature: sig });

    it("rejects mock signatures (no free orders)", async () => {
        await expect(verify("mock_x")).rejects.toMatchObject({ status: 400 });
    });

    it("rejects a short forged signature with 400 instead of crashing", async () => {
        await expect(verify("abc")).rejects.toMatchObject({ status: 400 });
    });

    it("accepts a correct HMAC signature", async () => {
        const good = crypto.createHmac("sha256", "prod_secret").update("order_ABC|pay_1").digest("hex");
        // passes the signature check, then fails only because the order does not exist
        await expect(verify(good)).rejects.toThrow("Order not found");
    });
});

describe("FR-3.3 Order status", () => {
    it("lets the seller move an order forward and the buyer see it", async () => {
        const buyer = await makeUser("buyer");
        const seller = await makeUser("seller");
        const p = await makeProduct(seller.user._id);
        const o = await order(buyer.user._id, p._id);
        await verifyPaymentService(mockPay(o._id));

        const res = await request(app).patch(`/api/orders/${o._id}/status`).set(seller.auth).send({ status: "shipped" });
        expect(res.status).toBe(200);
        const view = await request(app).get(`/api/orders/${o._id}`).set(buyer.auth);
        expect(view.body.data.status).toBe("shipped");
    });

    it("blocks a different seller from changing the status", async () => {
        const buyer = await makeUser("buyer");
        const seller = await makeUser("seller");
        const stranger = await makeUser("seller");
        const p = await makeProduct(seller.user._id);
        const o = await order(buyer.user._id, p._id);
        const res = await request(app).patch(`/api/orders/${o._id}/status`).set(stranger.auth).send({ status: "shipped" });
        expect(res.status).toBe(403);
    });
});
