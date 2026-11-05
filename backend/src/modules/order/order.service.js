import { getCartByUser, createOrUpdateCart } from "../cart/cart.repository.js";
import { findProductById } from "../product/product.repository.js";
import { createOrder } from "./order.repository.js";
import { AppError } from "../../utils/AppError.js";
import User from "../../models/user.model.js";
import { addNotification } from "../../config/queue.js";
import { Product } from "../../models/product.model.js";
import { Order } from "../../models/order.model.js";
import mongoose from "mongoose";

// Allowed order status changes. "paid" is set only by payment verification.
const TRANSITIONS = {
    pending: ["cancelled"],
    paid: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

export const applyStatusChange = async (order, status) => {
    const from = order.status;
    if (!TRANSITIONS[from]?.includes(status)) {
        throw new AppError(`Cannot change an order from ${from} to ${status}`, 409);
    }
    // Cancelling a paid order: put stock back and flag the refund
    if (from === "paid" && status === "cancelled") {
        order.refundStatus = "requested";
        for (const item of order.items) {
            const pId = item.productId?._id || item.productId;
            await Product.updateOne({ _id: pId }, { $inc: { stock: item.quantity } });
        }
    }
    order.status = status;
    await order.save();
    return order;
};

export const createOrderService = async (userId, directItems = null) => {
    let sourceItems = [];

    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
        sourceItems = directItems.map(item => ({
            productId: item.productId || item._id,
            quantity: item.quantity || 1
        }));
    } else {
        const cart = await getCartByUser(userId);
        if (!cart || cart.items.length === 0) {
            throw new AppError("Cart is empty", 400);
        }
        sourceItems = cart.items;
    }

    if (!sourceItems || sourceItems.length === 0) {
        throw new AppError("No items in order", 400);
    }

    let total = 0;
    const items = [];

    for (const item of sourceItems) {
        const pId = item.productId?._id || item.productId;
        const product = await findProductById(pId);

        if (!product) throw new AppError("Product not found", 404);
        if (!product.isApproved || !product.isActive) {
            throw new AppError(`${product.title} is not available for purchase`, 400);
        }
        if (product.biddingEnabled) {
            throw new AppError(`${product.title} is sold by auction, not at list price`, 400);
        }

        // Never trust client quantities: a negative quantity would make the total negative
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
            throw new AppError("Quantity must be a whole number from 1 to 100", 400);
        }

        if (product.stock < qty) {
            throw new AppError(`Insufficient stock for ${product.title}`, 400);
        }

        total += product.price * qty;

        items.push({
            productId: product._id,
            quantity: qty,
            price: product.price,
        });
    }

    const order = await createOrder({
        buyerId: userId,
        items,
        totalAmount: total,
    });

    // 1. Send Order Confirmation Job (Requirement 3)
    const buyer = await User.findById(userId);
    if (buyer) {
        await addNotification("order_confirmation", { 
            email: buyer.email, 
            orderId: order._id,
            totalAmount: order.totalAmount 
        });
    }

    // Clear the cart
    await createOrUpdateCart(userId, []);

    return order;
};

// Winner checkout: one order at the winning price. Calling it again returns the same
// open order, so a double-click on "Pay now" doesn't create duplicates.
export const createAuctionOrderService = async (userId, productId) => {
    if (!mongoose.isValidObjectId(productId)) throw new AppError("Invalid product ID", 400);
    const product = await Product.findById(productId);
    if (!product || !product.biddingEnabled) throw new AppError("Auction not found", 404);
    if (!product.auctionClosed) throw new AppError("Auction is still running", 409);
    if (product.auctionWinner?.toString() !== userId.toString()) {
        throw new AppError("Only the auction winner can buy this item", 403);
    }

    const existing = await Order.findOne({
        buyerId: userId, source: "auction", "items.productId": product._id, status: { $ne: "cancelled" },
    });
    if (existing) return existing;

    return await Order.create({
        buyerId: userId,
        source: "auction",
        items: [{ productId: product._id, quantity: 1, price: product.currentBid }],
        totalAmount: product.currentBid,
    });
};
