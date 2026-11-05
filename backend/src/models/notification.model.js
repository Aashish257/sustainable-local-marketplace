import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["order", "bid", "auction", "chat", "system"], default: "system" },
        message: { type: String, required: true, maxlength: 300 },
        link: { type: String, default: "/" },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Bell query: "my latest notifications" and "my unread count"
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
