import * as reviewService from "./review.service.js";

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private (Paid buyers only)
 */
export const createReview = async (req, res, next) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id; // Security: Extract userId from token

        const review = await reviewService.createReview(userId, productId, { rating, comment });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: review
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewService.getReviewsByProduct(productId);

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        next(err);
    }
};
