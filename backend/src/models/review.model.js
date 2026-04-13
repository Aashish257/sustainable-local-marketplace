import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"]
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"]
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating must be at most 5"]
        },
        comment: {
            type: String,
            trim: true,
            minlength: [10, "Comment must be at least 10 characters long"]
        }
    },
    {
        timestamps: true
    }
)

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);