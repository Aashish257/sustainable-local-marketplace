import redis from "../config/redis.js";

/**
 * Cache middleware for Express routes.
 * @param {number} ttl - Time to live in seconds (default 60).
 */
export const cacheMiddleware = (ttl = 60) => {
    return async (req, res, next) => {
        // Only cache GET requests, and only when Redis is actually connected
        if (req.method !== "GET" || redis.status !== "ready") return next();

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
                redis.setex(key, ttl, JSON.stringify(data)).catch((err) => {
                    // silently swallow since Redis caching is non-fatal
                });
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
    if (redis.status !== "ready") return; // nothing cached without Redis
    try {
        // SCAN walks keys in batches; KEYS blocks Redis while scanning everything
        let cursor = "0";
        let deleted = 0;
        do {
            const [next, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = next;
            if (keys.length > 0) deleted += await redis.del(...keys);
        } while (cursor !== "0");
        if (deleted > 0) console.log(`🧹 Cache Invalidated: ${pattern} (${deleted} keys)`);
    } catch (err) {
        console.error("❌ Cache Invalidation Error:", err);
    }
};
