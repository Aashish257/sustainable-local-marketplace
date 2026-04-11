import { z } from "zod";

export const createOrderSchema = z.object({
    // Currently no body required as it takes from cart
    // But we can add validation for optional immediate items if needed
});

export const createPaymentSchema = z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID"),
});

export const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1, "Razorpay Order ID is required"),
    razorpay_payment_id: z.string().min(1, "Razorpay Payment ID is required"),
    razorpay_signature: z.string().min(1, "Razorpay Signature is required"),
});
