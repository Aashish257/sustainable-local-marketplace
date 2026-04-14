import express from "express";
import * as reviewController from "./review.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createReviewSchema } from "./review.validation.js";

const router = express.Router();

// Public route to get all reviews for a product
router.get("/:productId", reviewController.getProductReviews);

// Protected route to create a review - Verified buyers only
router.post(
    "/",
    protect,
    validate(createReviewSchema),
    reviewController.createReview
);

export default router;
