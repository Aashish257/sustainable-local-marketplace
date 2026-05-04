import { createOrderService } from "./order.service.js";
import { Order } from "../../models/order.model.js";

export const createOrder = async (req, res, next) => {
    try {
        const order = await createOrderService(req.user.id);
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// GET /api/orders/my — Buyer: get own orders
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ buyerId: req.user.id })
            .populate("items.productId", "title price")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
};
