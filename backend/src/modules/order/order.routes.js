import express from "express";
import { createOrder, getMyOrders, getSellerOrders, updateOrderStatus, getOrderById, createAuctionOrder } from "./order.controller.js";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation.js";

const router = express.Router();

router.post("/", protect, authorize("buyer"), validate(createOrderSchema), createOrder);
router.post("/auction/:productId", protect, authorize("buyer"), createAuctionOrder);
router.get("/my", protect, getMyOrders);
router.get("/seller", protect, authorize("seller"), getSellerOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/status", protect, authorize("seller", "admin"), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
