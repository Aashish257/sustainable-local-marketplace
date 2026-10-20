import mongoose from "mongoose";
import { Notification } from "../../models/notification.model.js";
import { getIO } from "../../socket/index.js";
import { AppError } from "../../utils/AppError.js";

// Save a notification and push it live to the user's socket room.
// Never throws: a failed notification must not break an order, bid or payment.
export const notifyUser = async (userId, { type = "system", message, link = "/" }) => {
    if (!userId || !message) return null;
    try {
        const doc = await Notification.create({ userId, type, message, link });
        try {
            getIO().to(userId.toString()).emit("notification", doc.toJSON());
        } catch {
            // socket server not running (scripts/tests): the bell loads it from the API later
        }
        return doc;
    } catch (err) {
        console.error("❌ notifyUser failed:", err.message);
        return null;
    }
};

export const listNotifications = async (userId, { page = 1, limit = 20 }) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const [items, unreadCount] = await Promise.all([
        Notification.find({ userId }).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
        Notification.countDocuments({ userId, isRead: false }),
    ]);
    return { items, unreadCount };
};

export const markRead = async (userId, id) => {
    if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid notification id", 400);
    // userId in the filter = users can only touch their own notifications
    const doc = await Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true });
    if (!doc) throw new AppError("Notification not found", 404);
    return doc;
};

export const markAllRead = (userId) => Notification.updateMany({ userId, isRead: false }, { isRead: true });

export const clearAll = (userId) => Notification.deleteMany({ userId });
