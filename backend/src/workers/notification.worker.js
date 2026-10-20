import { Worker } from "bullmq";

const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    lazyConnect: true,
};

let notificationWorker;

try {
    // 1. Create the Worker
    notificationWorker = new Worker(
        "notifications",
        async (job) => {
            const { type, data } = job;

            console.log(`\n🔔 PROCESSING NOTIFICATION: ${job.name} (Job ID: ${job.id})`);

            switch (job.name) {
                case "order_confirmation":
                    console.log(`   📧 Sending Order Email to: ${data.email}`);
                    // [FUTURE]: Add Nodemailer logic here
                    break;

                case "bid_update":
                    console.log(`   📉 High Bid Alert for Product ${data.productId}: ₹${data.amount}`);
                    break;

                case "auction_closed":
                    console.log(`   🏁 Auction ${data.productId} closed. Winner: ${data.winnerId || "none"} at ₹${data.amount ?? "-"}`);
                    break;

                case "chat_alert":
                    console.log(`   💬 New Message from ${data.senderId} to ${data.receiverId}`);
                    break;

                default:
                    console.log(`   ❓ Unknown job type: ${job.name}`);
            }
        },
        { connection }
    );

    notificationWorker.on("completed", (job) => {
        console.log(`✅ Job ${job.id} completed!`);
    });

    notificationWorker.on("failed", (job, err) => {
        console.error(`❌ Job ${job.id} failed:`, err.message);
    });

    notificationWorker.on("error", (err) => {
        if (err.code === "ECONNREFUSED") {
            // Redis not available — silent in dev
        } else {
            console.error("❌ Notification worker error:", err.message);
        }
    });

    console.log("✅ Notification worker initialized");
} catch (err) {
    console.warn("⚠️  Notification worker could not start (Redis unavailable):", err.message);
}

export default notificationWorker;
