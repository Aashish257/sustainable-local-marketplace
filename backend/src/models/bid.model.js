import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"]
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"]
        },
        amount: {
            type: Number,
            required: [true, "Bid amount is required"],
            min: [0, "Bid amount must be positive"]
        }
    },
    { timestamps: true }
);

// High-performance index for fetching highest bid (Requirement 5 & 10)
bidSchema.index({ productId: 1, amount: -1 });

export const Bid = mongoose.model("Bid", bidSchema);
