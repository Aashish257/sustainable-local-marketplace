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

// GET /api/orders/seller — Seller: get orders for their products
export const getSellerOrders = async (req, res, next) => {
    try {
        // Find all orders where at least one item's productId belongs to this seller
        // We need to populate the product to check the sellerId
        const orders = await Order.find({})
            .populate({
                path: "items.productId",
                select: "title price sellerId",
                match: { sellerId: req.user.id }
            })
            .sort({ createdAt: -1 });

        // Filter out orders that have NO items belonging to the seller after populate match
        // and filter out items inside the order that don't belong to the seller
        const sellerOrders = orders
            .map(order => {
                const sellerItems = order.items.filter(item => item.productId !== null);
                if (sellerItems.length === 0) return null;
                
                return {
                    ...order.toObject(),
                    items: sellerItems,
                    // Recalculate totalAmount for just the seller's items in this order
                    totalAmount: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                };
            })
            .filter(order => order !== null);

        res.json({ success: true, data: sellerOrders });
    } catch (err) {
        next(err);
    }
};
