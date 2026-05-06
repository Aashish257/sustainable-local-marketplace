import User from "../../models/user.model.js";
import { Product } from "../../models/product.model.js";
import { Order } from "../order/order.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getSystemStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total platform revenue
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
        success: true,
        data: {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue
        }
    });
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
});

export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().populate('sellerId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: products });
});

export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
});
