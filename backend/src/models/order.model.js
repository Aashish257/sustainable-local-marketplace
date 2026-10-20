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
            enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        refundStatus: {
            type: String,
            enum: ["none", "requested", "processed", "failed"],
            default: "none",
        },


        paymentId: String,
        razorpayOrderId: String,
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);