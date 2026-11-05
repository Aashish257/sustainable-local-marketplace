import Redis from "ioredis";

const redisOptions = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    // TLS for production (Upstash requires rediss://)
    ...(process.env.NODE_ENV === "production" && { tls: {} }),
    retryStrategy: (times) => {
        // In development, limit retries to avoid flooding logs
        if (process.env.NODE_ENV !== "production" && times > 3) {
            console.warn("⚠️  Redis unavailable — disabling retry. Start Redis or set DISABLE_REDIS=true.");
            return null; // Stop retrying
        }
        const delay = Math.min(times * 200, 2000);
        return delay;
    },
    maxRetriesPerRequest: null, // Critical for BullMQ
    enableOfflineQueue: false,  // Don't queue commands when offline
    lazyConnect: true,          // Don't connect immediately on import
};

const redis = new Redis(redisOptions);

// Attach error handler BEFORE connect to prevent "missing error handler" crash
redis.on("error", (err) => {
    // Only log once, not every retry
    if (err.code === "ECONNREFUSED") {
        // silently swallow — already warned via retryStrategy
    } else {
        console.error("❌ Redis error:", err.message);
    }
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("ready", () => console.log("✅ Redis ready"));

// Attempt connection (non-blocking). DISABLE_REDIS=true skips it (tests, or no Redis locally).
export const redisDisabled = process.env.DISABLE_REDIS === "true";
if (redisDisabled) {
    console.log("ℹ️  DISABLE_REDIS=true — running without Redis (no cache, queue or socket adapter)");
} else {
    redis.connect().catch((err) => {
        console.warn(`⚠️  Redis connection failed (${err.message}) — real-time features will use in-memory fallback.`);
    });
}

export default redis;
