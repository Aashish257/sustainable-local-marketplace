import crypto from "crypto";
import razorpay from "../../config/razorpay.js";
import { findOrderById, findOrderByRazorpayId, updateOrder as updateOrderRepo } from "../order/order.repository.js";
import { updateProduct as updateProductRepo } from "../product/product.repository.js";

export const createRazorpayOrderService = async (orderId) => {
    const order = await findOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const options = {
        amount: Math.round(order.totalAmount * 100), // Amount in paisa
        currency: "INR",
        receipt: orderId.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save razorpayOrderId to our Order
    await updateOrderRepo(orderId, { razorpayOrderId: razorpayOrder.id });

    return razorpayOrder;
};

export const verifyPaymentService = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) => {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature !== expectedSign) {
        throw new Error("Invalid payment signature");
    }

    // Payment is verified
    const order = await findOrderByRazorpayId(razorpay_order_id);

    if (!order) throw new Error("Order not found for this payment");

    const updatedOrder = await updateOrderRepo(order._id, { status: "paid", paymentId: razorpay_payment_id });

    // Atomic Stock Reduction
    for (const item of order.items) {
        await updateProductRepo(item.productId, {
            $inc: { stock: -item.quantity },
        });
    }

    return updatedOrder;
};
