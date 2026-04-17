import express from "express";
import * as productController from "./product.controller.js";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";

const router = express.Router();

/**
 * Product Routes (Requirement 7 & 8)
 * Middleware order: protect -> authorize -> controller (Requirement 7)
 */

// Public routes
router.get("/", cacheMiddleware(60), productController.getProducts);
router.get("/:id", productController.getProductById);


// Protected routes - Seller only (Requirement 7)
router.post(
    "/",
    protect,
    authorize("seller"),
    productController.createProduct
);

// Protected routes - Seller + Ownership check (handled in service layer)
router.put(
    "/:id",
    protect,
    authorize("seller"),
    productController.updateProduct
);

router.delete(
    "/:id",
    protect,
    authorize("seller"),
    productController.deleteProduct
);

export default router;
