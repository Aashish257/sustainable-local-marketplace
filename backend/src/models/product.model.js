import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Product title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters long"]
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0.01, "Price must be a positive number"]
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Seller ID is required"]
        },
        category: {
            type: String,
            trim: true,
            default: "general"
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative"]
        },
        images: [
            {
                type: String
            }
        ],
        sustainabilityScore: {
            type: Number,
            min: [0, "Score minimum is 0"],
            max: [10, "Score maximum is 10"],
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0,
            min: [0, "Rating minimum is 0"],
            max: [5, "Rating maximum is 5"]
        },
        totalReviews: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model("Product", productSchema);
