import express from "express";
import { getHighestBid } from "./bid.controller.js";

const router = express.Router();

// GET /api/bids/:productId — Public (anyone can see the current bid)
router.get("/:productId", getHighestBid);

export default router;
