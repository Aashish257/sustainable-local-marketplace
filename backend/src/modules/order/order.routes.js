import express from "express";
import { createOrder, getMyOrders } from "./order.controller.js";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createOrderSchema } from "./order.validation.js";

const router = express.Router();

router.post("/", protect, authorize("buyer"), validate(createOrderSchema), createOrder);
router.get("/my", protect, getMyOrders);

export default router;
