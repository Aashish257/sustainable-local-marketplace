import { Message } from "../models/message.model.js";
import User from "../models/user.model.js";
import { addNotification } from "../config/queue.js";

export default (io, socket) => {
    // 1. JOIN OWN ROOM (Requirement 3)
    // Every user joins a room identified by their own userId.
    // This allows us to send messages directly to them by targeting their room.
    socket.join(socket.user.id);

    // 2. SEND MESSAGE EVENT (Requirement 4)
    socket.on("send_message", async (data) => {
        const { receiverId, message } = data;
        const senderId = socket.user.id;

        // Basic Validation (Requirement 4 & 7)
        if (!message || message.trim().length === 0) return;
        if (senderId === receiverId) return;

        try {
            // Verify receiver exists
            const receiverExists = await User.findById(receiverId);
            if (!receiverExists) {
                return socket.emit("chat_error", { message: "Receiver not found" });
            }

            // Persistence: Save to DB (Requirement 6)
            const newMessage = await Message.create({
                senderId,
                receiverId,
                message: message.trim()
            });

            // Delivery: Emit to receiver's private room (Requirement 4)
            // Note: We also emit to the sender's room so their other devices (if any) stay in sync.
            io.to(receiverId).emit("receive_message", newMessage);
            socket.emit("message_sent", newMessage); // Acknowledge to sender

            // Real-time notification to receiver
            io.to(receiverId).emit("notification", {
                type: "chat",
                message: `💬 New message from ${socket.user.name || "someone"}`,
                link: "/"
            });

            // 1. Queue Background Job for Notification (Requirement 3)
            await addNotification("chat_alert", {
                senderId,
                receiverId,
                message: message.trim().substring(0, 50) + "..."
            });

        } catch (err) {
            console.error("Chat Error:", err);
            socket.emit("chat_error", { message: "Failed to send message" });
        }
    });


    // Handle typing indicator (Optional but good signal)
    socket.on("typing", (data) => {
        const { receiverId } = data;
        io.to(receiverId).emit("user_typing", { senderId: socket.user.id });
    });
};
