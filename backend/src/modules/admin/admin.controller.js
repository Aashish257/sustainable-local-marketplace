import User from "../../models/user.model.js";
import { Product } from "../../models/product.model.js";
import { Order } from "../../models/order.model.js";
import { invalidateCache } from "../../middleware/cache.middleware.js";

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
        // ?status=pending | approved narrows the moderation queue
        const filter = {};
        if (req.query.status === "pending") filter.isApproved = false;
        if (req.query.status === "approved") filter.isApproved = true;
        const products = await Product.find(filter).populate('sellerId', 'name email').sort({ createdAt: -1 });
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

// PATCH /api/admin/users/:id/role
export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["buyer", "seller", "admin"].includes(role)) {
            return res.status(400).json({ success: false, error: "Invalid role specified" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Prevent self-demotion
        if (user._id.toString() === req.user.id && role !== "admin") {
            return res.status(400).json({ success: false, error: "Administrators cannot self-demote" });
        }

        user.role = role;
        await user.save();

        res.json({ success: true, data: { id: user._id, role: user.role } });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id === req.user.id) {
            return res.status(400).json({ success: false, error: "Administrators cannot delete themselves" });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/admin/products/:id
// PATCH /api/admin/products/:id/approval  body: { approved: boolean }
export const setProductApproval = async (req, res, next) => {
    try {
        const { approved } = req.body;
        if (typeof approved !== "boolean") {
            return res.status(400).json({ success: false, error: "approved must be true or false" });
        }
        const product = await Product.findByIdAndUpdate(req.params.id, { isApproved: approved }, { new: true });
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }
        await invalidateCache("cache:/api/products*"); // catalog list must reflect the change
        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

export const deleteProductAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/admin/orders/:id/status
export const updateOrderStatusAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        order.status = status;
        await order.save();

        res.json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};
