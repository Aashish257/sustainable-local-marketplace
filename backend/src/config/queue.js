import { Queue } from "bullmq";
import redis from "./redis.js";

// Standard connection options for BullMQ
const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
};

// 1. Create the Notification Queue (Requirement 3)
export const notificationQueue = new Queue("notifications", { connection });

/**
 * Helper to add notification jobs.
 */
export const addNotification = async (type, data) => {
    await notificationQueue.add(type, data, {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
    });
    console.log(`✉️ Job Added: ${type}`);
};
