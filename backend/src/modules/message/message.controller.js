import { Message } from "../../models/message.model.js";
import { AppError } from "../../utils/AppError.js";

/**
 * @desc    Get chat history between logged-in user and another user
 * @route   GET /api/messages/:receiverId
 * @access  Private
 */
export const getChatHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { receiverId } = req.params;

        // Fetch messages both sent and received between the two users
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId },
                { senderId: receiverId, receiverId: userId }
            ]
        })
        .sort({ createdAt: 1 }) // oldest first for chat display
        .lean();

        res.json({ success: true, data: messages });
    } catch (err) {
        next(err);
    }
};
