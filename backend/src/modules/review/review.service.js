// src/modules/review/review.service.js
import { Review } from "../../models/review.model.js";
import { Order } from "../../models/order.model.js";
import { Product } from "../../models/product.model.js";

export const createReview = async (userId, productId, reviewData) => {
    // 1. PURCHASE VERIFICATION
    const hasPurchased = await Order.findOne({
        buyerId: userId,
        status: "paid",
        "items.productId": productId
    });

    if (!hasPurchased) {
        throw new Error("You can only review products you have purchased.");
    }

    // 2. DUPLICATE CHECK
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
        throw new Error("You have already reviewed this product.");
    }

    // 3. CREATE REVIEW
    const review = await Review.create({
        userId,
        productId,
        ...reviewData
    });

    // 4. ATOMIC UPDATE OF PRODUCT RATING
    await Product.findByIdAndUpdate(
        productId,
        [
            {
                $set: {
                    averageRating: {
                        $cond: [
                            { $eq: ["$totalReviews", 0] },
                            review.rating,
                            {
                                $divide: [
                                    {
                                        $add: [
                                            { $multiply: ["$averageRating", "$totalReviews"] },
                                            review.rating
                                        ]
                                    },
                                    { $add: ["$totalReviews", 1] }
                                ]
                            }
                        ]
                    },
                    totalReviews: { $add: ["$totalReviews", 1] }
                }
            }
        ]
    );

    return review;
};

export const getReviewsByProduct = async (productId) => {
    return await Review.find({ productId })
        .populate("userId", "name")
        .sort({ createdAt: -1 });
};

