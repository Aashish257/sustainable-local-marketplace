import redis from "../config/redis.js";

/**
 * Cache middleware for Express routes.
 * @param {number} ttl - Time to live in seconds (default 60).
 */
export const cacheMiddleware = (ttl = 60) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") return next();

        // Generate unique key based on path and query params (Requirement 1)
        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedData = await redis.get(key);

            if (cachedData) {
                console.log(`⚡ Cache Hit: ${key}`);
                return res.json(JSON.parse(cachedData));
            }

            // If not cached, override res.json to store the result before sending
            console.log(`❄️ Cache Miss: ${key}`);
            const originalJson = res.json;
            
            res.json = function (data) {
                // Store in Redis with TTL
                redis.setex(key, ttl, JSON.stringify(data));
                return originalJson.call(this, data);
            };

            next();
        } catch (err) {
            console.error("Cache Error:", err);
            next(); // Proceed to DB if Redis fails
        }
    };
};

/**
 * Utility to invalidate specific cache patterns.
 * @param {string} pattern - key pattern to delete (e.g., "cache:/api/products*")
 */
export const invalidateCache = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`🧹 Cache Invalidated: ${pattern} (${keys.length} keys)`);
        }
    } catch (err) {
        console.error("❌ Cache Invalidation Error:", err);
    }
};
