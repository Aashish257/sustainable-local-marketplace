import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { verifyAccessToken } from "../middleware/auth.middleware.js";
import chatHandler from "./chat.socket.js";
import bidHandler from "./bid.socket.js";
import redis from "../config/redis.js";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Apply Redis Adapter only if Redis is actually connected
    // In development without Redis, fall back to in-memory adapter (single-server only)
    try {
        const pubClient = redis;
        const subClient = redis.duplicate();

        // Add error handler to the duplicated client to prevent unhandled crashes
        subClient.on("error", (err) => {
            console.warn("⚠️  Socket Redis sub-client error (non-fatal in dev):", err.message);
        });
        pubClient.on("error", (err) => {
            console.warn("⚠️  Socket Redis pub-client error (non-fatal in dev):", err.message);
        });

        // Only attach the Redis adapter if Redis is in a ready/connected state
        if (redis.status === "ready") {
            io.adapter(createAdapter(pubClient, subClient));
            console.log("✅ Socket.IO using Redis adapter");
        } else {
            console.warn("⚠️  Redis not ready — Socket.IO using in-memory adapter (dev mode). Real-time features will work on a single server only.");
        }
    } catch (err) {
        console.warn("⚠️  Could not attach Redis adapter — using in-memory fallback:", err.message);
    }

    // SOCKET AUTH MIDDLEWARE
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        try {
            // Same check as REST: suspended or logged-out users can't open a socket
            socket.user = await verifyAccessToken(token);
            next();
        } catch {
            next(new Error("Authentication error: Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`✅ Socket Connected: ${socket.user.id} (${socket.id})`);

        chatHandler(io, socket);
        bidHandler(io, socket);

        socket.on("disconnect", () => {
            console.log(`❌ Socket Disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
