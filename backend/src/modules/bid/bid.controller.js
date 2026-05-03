import { Bid } from "../../models/bid.model.js";

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
