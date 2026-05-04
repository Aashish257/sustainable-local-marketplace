import { Bid } from "../models/bid.model.js";
import { Product } from "../models/product.model.js";
import { addNotification } from "../config/queue.js";

export default (io, socket) => {

    // 1. JOIN PRODUCT ROOM (Requirement 3)
    // Users join a specific room for the product they are watching.
    socket.on("join_product", (productId) => {
        socket.join(`product:${productId}`);
        console.log(`User ${socket.user.id} joined product room: ${productId}`);
    });

    // 2. PLACE BID EVENT (Requirement 5)
    socket.on("place_bid", async (data) => {
        const { productId, amount } = data;
        const userId = socket.user.id;

        try {
            // A. Validate Product Existence
            const product = await Product.findById(productId);
            if (!product) {
                return socket.emit("bid_error", { message: "Product not found" });
            }

            // B. Fetch Highest Bid from DB (Requirement 5 & 10)
            const highestBid = await Bid.findOne({ productId })
                .sort({ amount: -1 })
                .limit(1);

            const currentHigh = highestBid ? highestBid.amount : product.price;

            // C. Business Logic (Requirement 5) - Reject lower or equal bids
            if (amount <= currentHigh) {
                return socket.emit("bid_error", { 
                    message: `Bid must be higher than current price of ₹${currentHigh}` 
                });
            }

            // D. Persistence: Save valid bid (Requirement 6)
            const newBid = await Bid.create({
                productId,
                userId,
                amount
            });

            // E. Broadcast: Notify everyone in the product room (Requirement 5)
            io.to(`product:${productId}`).emit("new_bid", {
                productId,
                amount: newBid.amount,
                userId: newBid.userId,
                timestamp: newBid.createdAt
            });

            // Real-time notification to all watchers
            io.to(`product:${productId}`).emit("notification", {
                type: "bid",
                message: `🔨 New bid of ₹${newBid.amount} placed!`,
                link: `/products/${productId}`
            });

            // 1. Queue Background Job for Notification (Requirement 3)
            await addNotification("bid_update", {
                productId,
                amount: newBid.amount,
                userId: newBid.userId
            });

        } catch (err) {

            console.error("Bidding Error:", err);
            socket.emit("bid_error", { message: "Failed to place bid" });
        }
    });

    // Optional: Leave product room
    socket.on("leave_product", (productId) => {
        socket.leave(`product:${productId}`);
    });
};
