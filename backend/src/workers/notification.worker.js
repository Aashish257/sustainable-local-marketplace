import { Worker } from "bullmq";

const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
};

// 1. Create the Worker (Requirement 3)
const notificationWorker = new Worker(
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

export default notificationWorker;
