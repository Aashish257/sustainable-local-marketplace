import express from "express";
import { createPaymentOrder, verifyPayment } from "./payment.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createPaymentSchema, verifyPaymentSchema } from "../order/order.validation.js";

const router = express.Router();

router.post("/create", protect, validate(createPaymentSchema), createPaymentOrder);
router.post("/verify", protect, validate(verifyPaymentSchema), verifyPayment);

export default router;
