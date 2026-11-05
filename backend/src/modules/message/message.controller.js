import { Message } from "../../models/message.model.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";

/**
 * @desc    Get all active conversations/threads for logged-in user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userObjId = new mongoose.Types.ObjectId(userId);

        // Find all messages involving this user
        const allMessages = await Message.find({
            $or: [{ senderId: userObjId }, { receiverId: userObjId }]
        })
        .sort({ createdAt: -1 })
        .lean();

        // Group by other user ID
        const conversationMap = new Map();

        for (const msg of allMessages) {
            const isSender = msg.senderId.toString() === userId.toString();
            const contactId = isSender ? msg.receiverId.toString() : msg.senderId.toString();

            if (!conversationMap.has(contactId)) {
                conversationMap.set(contactId, {
                    userId: contactId,
                    lastMessage: msg.message,
                    lastMessageAt: msg.createdAt,
                    unread: !isSender && !msg.read ? 1 : 0
                });
            } else {
                const existing = conversationMap.get(contactId);
                if (!isSender && !msg.read) {
                    existing.unread += 1;
                }
            }
        }

        const contactIds = Array.from(conversationMap.keys());
        const contactUsers = await User.find({ _id: { $in: contactIds } })
            .select("name email role")
            .lean();

        const userMap = new Map(contactUsers.map(u => [u._id.toString(), u]));

        const conversations = [];
        for (const [contactId, convData] of conversationMap.entries()) {
            const userProfile = userMap.get(contactId);
            if (userProfile) {
                conversations.push({
                    userId: contactId,
                    name: userProfile.name,
                    email: userProfile.email,
                    role: userProfile.role,
                    lastMessage: convData.lastMessage,
                    lastMessageAt: convData.lastMessageAt,
                    unread: convData.unread
                });
            }
        }

        res.json({ success: true, data: conversations });
    } catch (err) {
        next(err);
    }
};

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

/**
 * @desc    Send a message via REST endpoint
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { receiverId, message, content } = req.body;

        const text = message || content;
        if (!receiverId || !text) {
            return res.status(400).json({ success: false, error: "receiverId and message are required" });
        }

        const newMsg = await Message.create({
            senderId,
            receiverId,
            message: text
        });

        res.status(201).json({
            success: true,
            data: newMsg
        });
    } catch (err) {
        next(err);
    }
};

