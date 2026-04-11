import { createOrderService } from "./order.service.js";

export const createOrder = async (req, res, next) => {
    try {
        const order = await createOrderService(req.user.id);
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};
