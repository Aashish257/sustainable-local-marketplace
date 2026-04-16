import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender ID is required"]
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Receiver ID is required"]
        },
        message: {
            type: String,
            required: [true, "Message content is required"],
            trim: true
        }
    },
    { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
