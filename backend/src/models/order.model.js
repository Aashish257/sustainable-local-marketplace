import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                quantity: Number,
                price: Number,
            },
        ],

        totalAmount: Number,

        status: {
            type: String,
            enum: ["pending", "paid", "shipped"],
            default: "pending",
        },

        paymentId: String,
        razorpayOrderId: String,
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);