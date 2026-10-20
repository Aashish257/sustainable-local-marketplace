import { placeBid } from "../modules/bid/bid.service.js";
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
            const newBid = await placeBid({ productId, userId, amount });

            // E. Broadcast: Notify everyone in the product room (Requirement 5)
            io.to(`product:${productId}`).emit("new_bid", {
                productId,
                amount: newBid.amount,
                userId: newBid.userId,
                timestamp: newBid.createdAt
            });


            // 1. Queue Background Job for Notification (Requirement 3)
            await addNotification("bid_update", {
                productId,
                amount: newBid.amount,
                userId: newBid.userId
            });

        } catch (err) {

            console.error("Bidding Error:", err);
            socket.emit("bid_error", { message: err.status ? err.message : "Failed to place bid" });
        }
    });

    // Optional: Leave product room
    socket.on("leave_product", (productId) => {
        socket.leave(`product:${productId}`);
    });
};
