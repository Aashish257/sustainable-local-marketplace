import User from "../../models/user.model.js";
import { Product } from "../../models/product.model.js";
import { Order } from "../../models/order.model.js";

export const getSystemStats = async (req, res, next) => {
    try {
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
    } catch (err) {
        next(err);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find().populate('sellerId', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, data: products });
    } catch (err) {
        next(err);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('buyerId', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
};
