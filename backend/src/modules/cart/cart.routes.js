import express from "express";
import { addToCart, getCart, removeFromCart } from "./cart.controller.js";
import { protect, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, authorize("buyer"), addToCart);
router.get("/", protect, authorize("buyer"), getCart);
router.delete("/:id", protect, authorize("buyer"), removeFromCart);

export default router;