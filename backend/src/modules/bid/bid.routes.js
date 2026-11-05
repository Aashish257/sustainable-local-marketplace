import express from "express";
import { getHighestBid, createBid } from "./bid.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/bids/:productId — Public (anyone can see the current bid)
router.get("/:productId", getHighestBid);

// POST /api/bids — Authenticated (place a bid)
router.post("/", protect, createBid);

export default router;

