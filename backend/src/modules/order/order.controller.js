import { createOrderService } from "./order.service.js";
import { Order } from "../../models/order.model.js";
import { notifyUser } from "../notification/notification.service.js";

export const createOrder = async (req, res, next) => {
    try {
        const order = await createOrderService(req.user.id, req.body.items);
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// GET /api/orders/my — Buyer: get own orders
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ buyerId: req.user.id })
            .populate("items.productId", "title price images")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
};

// GET /api/orders/:id — Get order by ID (Buyer / Seller / Admin)
export const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id)
            .populate("items.productId", "title price images sustainabilityScore category sellerId")
            .populate("buyerId", "name email");

        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        const isBuyer = order.buyerId?._id?.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        const isSeller = order.items.some(
            (item) => item.productId?.sellerId?.toString() === req.user.id
        );

        if (!isBuyer && !isAdmin && !isSeller) {
            return res.status(403).json({ success: false, error: "Not authorized to view this order" });
        }

        res.json({ success: true, data: order });
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
                select: "title price sellerId images",
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

// PATCH /api/orders/:id/status — Update order status (Seller/Admin)
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id).populate("items.productId");
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        // Sellers can only update orders that contain their products
        if (req.user.role === "seller") {
            const belongsToSeller = order.items.some(
                (item) => item.productId && item.productId.sellerId && item.productId.sellerId.toString() === req.user.id
            );

            if (!belongsToSeller) {
                return res.status(403).json({ success: false, error: "Unauthorized to update this order status" });
            }
        }

        order.status = status;
        await order.save();
        await notifyUser(order.buyerId, { type: "order", message: `Your order #${order._id.toString().slice(-6)} is now ${status}.`, link: `/orders/${order._id}` });

        res.json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};
