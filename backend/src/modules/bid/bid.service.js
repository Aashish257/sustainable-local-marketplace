import { Bid } from "../../models/bid.model.js";
import { Product } from "../../models/product.model.js";
import { AppError } from "../../utils/AppError.js";
import { notifyUser } from "../notification/notification.service.js";

// Single source of truth for bidding (used by REST and socket)
export const placeBid = async ({ productId, userId, amount }) => {
    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new AppError("Invalid bid amount", 400);

    const product = await Product.findById(productId)
        .select("title biddingEnabled biddingEndTime biddingStartingPrice price auctionClosed isApproved isActive");
    if (!product || !product.isApproved || !product.isActive) throw new AppError("Product not found", 404);
    if (!product.biddingEnabled) throw new AppError("Bidding is not enabled for this product", 400);
    if (product.auctionClosed || (product.biddingEndTime && product.biddingEndTime < new Date())) {
        throw new AppError("Auction has ended", 400);
    }

    const floor = product.biddingStartingPrice || product.price;
    if (amount <= floor) throw new AppError(`Bid must be higher than ₹${floor}`, 400);

    // Atomic: wins only if the amount beats the current bid AND the auction is still open
    // (re-checked here so a bid can't slip in after the scheduler closes the auction)
    const previous = await Product.findOneAndUpdate(
        {
            _id: productId,
            auctionClosed: { $ne: true },
            $and: [
                { $or: [{ currentBid: null }, { currentBid: { $lt: amount } }] },
                { $or: [{ biddingEndTime: null }, { biddingEndTime: { $gt: new Date() } }] },
            ],
        },
        { $set: { currentBid: amount, currentBidder: userId } },
        { new: false } // return the doc BEFORE the update so we know who was outbid
    );
    if (!previous) throw new AppError("A higher or equal bid already exists, or the auction just ended", 409);

    const bid = await Bid.create({ productId, userId, amount });

    // Tell the previous leader they were outbid (fire-and-forget: never slows the bid)
    if (previous.currentBidder && previous.currentBidder.toString() !== userId.toString()) {
        notifyUser(previous.currentBidder, {
            type: "bid",
            message: `You've been outbid on "${product.title}": new top bid ₹${amount}`,
            link: `/products/${productId}`,
        });
    }
    return bid;
};

// Close every auction whose end time has passed. Safe to run on many servers at once:
// the conditional update means each auction is closed exactly once.
export const closeExpiredAuctions = async (now = new Date()) => {
    const due = await Product.find({
        biddingEnabled: true,
        auctionClosed: { $ne: true },
        biddingEndTime: { $lte: now },
    }).select("_id currentBidder");

    const closed = [];
    for (const { _id, currentBidder } of due) {
        // placeBid rejects bids after the end time, so currentBidder can no longer change here
        const product = await Product.findOneAndUpdate(
            { _id, auctionClosed: { $ne: true } },
            { $set: { auctionClosed: true, auctionWinner: currentBidder || null } },
            { new: true }
        );
        if (product) closed.push(product);
    }
    return closed;
};
