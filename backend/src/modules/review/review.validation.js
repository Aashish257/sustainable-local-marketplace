// src/modules/review/review.validation.js
import { z } from "zod";

export const createReviewSchema = z.object({
    body: z.object({
        productId: z.string({ required_error: "Product ID is required" }),
        rating: z.number()
            .min(1, "Minimum rating is 1")
            .max(5, "Maximum rating is 5"),
        comment: z.string()
            .min(10, "Comment must be at least 10 chars")
            .max(500, "Comment too long")
            .optional()
    })
});
