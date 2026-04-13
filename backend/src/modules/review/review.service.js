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


    // Check for existing review explicitly for a better error message
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
        throw new Error("You have already reviewed this product.");
    }


    // 2. CREATE REVIEW (The unique index will catch duplicates)
    const review = await Review.create({
        userId,
        productId,
        ...reviewData
    });

    // 3. ATOMIC UPDATE OF PRODUCT RATING
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
                                            reviewData.rating
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
