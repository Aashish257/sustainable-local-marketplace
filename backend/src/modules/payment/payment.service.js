import crypto from "crypto";
import razorpay from "../../config/razorpay.js";
import { findOrderById, findOrderByRazorpayId, updateOrder as updateOrderRepo } from "../order/order.repository.js";
import { updateProduct as updateProductRepo, decrementStockIfAvailable } from "../product/product.repository.js";
import { AppError } from "../../utils/AppError.js";

const isTestKey = (key) => !key || key === "rzp_test_dummy" || key.includes("dummy");

export const createRazorpayOrderService = async (orderId) => {
    const order = await findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const amountInPaisa = Math.round(order.totalAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";

    // If dummy test key is configured, create simulated test order without network failure
    if (isTestKey(keyId)) {
        const mockOrderId = `order_test_${orderId.toString().slice(-8)}_${Date.now()}`;
        await updateOrderRepo(orderId, { razorpayOrderId: mockOrderId });

        return {
            id: mockOrderId,
            entity: "order",
            amount: amountInPaisa,
            amount_paid: 0,
            amount_due: amountInPaisa,
            currency: "INR",
            receipt: orderId.toString(),
            status: "created",
            isTestMode: true,
            key: keyId
        };
    }

    try {
        const options = {
            amount: amountInPaisa, // Amount in paisa
            currency: "INR",
            receipt: orderId.toString(),
        };

        const razorpayOrder = await razorpay.orders.create(options);
        await updateOrderRepo(orderId, { razorpayOrderId: razorpayOrder.id });
        return razorpayOrder;
    } catch (err) {
        console.warn("⚠️ Razorpay API call failed, falling back to test order:", err.message);
        const mockOrderId = `order_test_${orderId.toString().slice(-8)}_${Date.now()}`;
        await updateOrderRepo(orderId, { razorpayOrderId: mockOrderId });

        return {
            id: mockOrderId,
            entity: "order",
            amount: amountInPaisa,
            amount_paid: 0,
            amount_due: amountInPaisa,
            currency: "INR",
            receipt: orderId.toString(),
            status: "created",
            isTestMode: true,
            key: keyId
        };
    }
};

export const verifyPaymentService = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
}) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";
    // Mock payments are only allowed outside production
    const allowMock = process.env.NODE_ENV !== "production";
    const isMock = allowMock && (
        razorpay_order_id?.startsWith("order_test_") ||
        razorpay_signature === "test_mode_signature" ||
        razorpay_signature?.startsWith("sig_mock_") ||
        razorpay_signature?.startsWith("mock_") ||
        isTestKey(process.env.RAZORPAY_KEY_ID)
    );

    if (!isMock) {
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", keySecret)
            .update(sign.toString())
            .digest("hex");

        // Constant-time compare; lengths must match or timingSafeEqual throws
        const expected = Buffer.from(expectedSign, "hex");
        const received = Buffer.from(String(razorpay_signature || ""), "hex");
        if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
            throw new AppError("Invalid payment signature", 400);
        }
    }

    // Payment is verified
    let order = (orderId ? await findOrderById(orderId) : null) || await findOrderByRazorpayId(razorpay_order_id);

    if (!order) throw new Error("Order not found for this payment");

    // Idempotency: never process a paid/cancelled order twice
    if (order.status !== "pending") {
        throw new AppError(`Order already ${order.status}`, 409);
    }

    const paymentId = razorpay_payment_id || `pay_test_${Date.now()}`;

    // Reserve stock atomically BEFORE marking the order paid
    const reserved = [];
    for (const item of order.items) {
        const pId = item.productId?._id || item.productId;
        const ok = await decrementStockIfAvailable(pId, item.quantity);

        if (!ok) {
            // Give back stock already taken for earlier items
            for (const r of reserved) {
                await updateProductRepo(r.pId, { $inc: { stock: r.qty } });
            }
            // Buyer paid but item sold out → cancel and refund
            let refundStatus = "requested";
            if (!isMock) {
                try {
                    await razorpay.payments.refund(paymentId, {});
                    refundStatus = "processed";
                } catch {
                    refundStatus = "failed";
                }
            }
            await updateOrderRepo(order._id, { status: "cancelled", paymentId, refundStatus });
            throw new AppError("Item sold out. Your payment will be refunded.", 409);
        }
        reserved.push({ pId, qty: item.quantity });
    }

    return await updateOrderRepo(order._id, { status: "paid", paymentId });

};
