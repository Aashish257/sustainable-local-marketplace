import { createRazorpayOrderService, verifyPaymentService } from "./payment.service.js";

export const createPaymentOrder = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        const razorpayOrder = await createRazorpayOrderService(orderId);
        res.json({ success: true, data: razorpayOrder });
    } catch (err) {
        next(err);
    }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const order = await verifyPaymentService(req.body);
        res.json({
            success: true,
            message: "Payment verified and order updated successfully",
            data: order,
        });
    } catch (err) {
        next(err);
    }
};
