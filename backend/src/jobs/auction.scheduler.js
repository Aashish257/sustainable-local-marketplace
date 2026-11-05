import { closeExpiredAuctions } from "../modules/bid/bid.service.js";
import { getIO } from "../socket/index.js";
import { addNotification } from "../config/queue.js";
import { notifyUser } from "../modules/notification/notification.service.js";

// Decision: a MongoDB sweep instead of a BullMQ delayed job.
// It works when Redis is down (fail-soft) and catches auctions missed during a restart.
// Late bids are impossible anyway, because placeBid checks biddingEndTime.
const INTERVAL_MS = Number(process.env.AUCTION_SWEEP_MS) || 30_000;

export const runAuctionSweep = async () => {
    try {
        const closed = await closeExpiredAuctions();
        for (const p of closed) {
            const payload = {
                productId: p._id.toString(),
                winnerId: p.auctionWinner ? p.auctionWinner.toString() : null,
                amount: p.currentBid,
            };
            getIO().to(`product:${payload.productId}`).emit("auction_closed", payload);
            // Fire-and-forget: a slow or missing Redis must not stall the sweep
            addNotification("auction_closed", { ...payload, sellerId: p.sellerId.toString() }).catch(() => {});

            const link = `/products/${payload.productId}`;
            if (payload.winnerId) {
                await notifyUser(payload.winnerId, { type: "auction", message: `🏆 You won "${p.title}" at ₹${p.currentBid}`, link });
            }
            await notifyUser(p.sellerId, {
                type: "auction",
                message: payload.winnerId ? `Your auction "${p.title}" sold for ₹${p.currentBid}` : `Your auction "${p.title}" ended with no bids`,
                link,
            });
        }
        return closed.length;
    } catch (err) {
        console.error("❌ Auction sweep failed:", err.message);
        return 0;
    }
};

export const startAuctionScheduler = () => {
    const timer = setInterval(runAuctionSweep, INTERVAL_MS);
    timer.unref(); // don't keep the process alive just for this timer
    return timer;
};
