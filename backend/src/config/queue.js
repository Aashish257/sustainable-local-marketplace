import { Queue } from "bullmq";

// Standard connection options for BullMQ
const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    lazyConnect: true,
};

// 1. Create the Notification Queue
let notificationQueue;
try {
    if (process.env.DISABLE_REDIS === "true") throw new Error("DISABLE_REDIS=true");
    notificationQueue = new Queue("notifications", { connection });
    notificationQueue.on("error", (err) => {
        if (err.code !== "ECONNREFUSED") {
            console.error("❌ Queue error:", err.message);
        }
    });
    console.log("✅ Notification queue initialized");
} catch (err) {
    console.warn("⚠️  Notification queue failed to initialize (Redis unavailable):", err.message);
}

/**
 * Helper to add notification jobs.
 * Gracefully skips if queue is not available (no Redis).
 */
export const addNotification = async (type, data) => {
    if (!notificationQueue) {
        console.warn("⚠️  addNotification skipped — queue not available (Redis down)");
        return;
    }
    try {
        await notificationQueue.add(type, data, {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: true,
        });
        console.log(`✉️ Job Added: ${type}`);
    } catch (err) {
        console.warn(`⚠️  Could not add job "${type}":`, err.message);
    }
};

export { notificationQueue };
