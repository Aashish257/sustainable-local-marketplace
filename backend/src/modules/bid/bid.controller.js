import { Bid } from "../../models/bid.model.js";
import { placeBid } from "./bid.service.js";

/**
 * @desc    Get the current highest bid for a product
 * @route   GET /api/bids/:productId
 * @access  Public
 */
export const getHighestBid = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const highestBid = await Bid.findOne({ productId })
            .sort({ amount: -1 })
            .populate("userId", "name")
            .lean();

        res.json({
            success: true,
            data: highestBid || null // null means no bids yet
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Place a bid via REST endpoint
 * @route   POST /api/bids
 * @access  Private (Authenticated)
 */
export const createBid = async (req, res, next) => {
    try {
        const { productId, amount } = req.body;
        const userId = req.user.id;

        const newBid = await placeBid({ productId, userId, amount });

        res.status(201).json({
            success: true,
            data: newBid
        });
    } catch (err) {
        next(err);
    }
};
