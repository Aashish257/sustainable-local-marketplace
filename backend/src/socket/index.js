import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken";
import chatHandler from "./chat.socket.js";
import bidHandler from "./bid.socket.js";
import redis from "../config/redis.js";

let io;

export const initSocket = (server) => {
    const pubClient = redis;
    const subClient = redis.duplicate();

    io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    // Apply Redis Adapter for scaling (Requirement 2)
    io.adapter(createAdapter(pubClient, subClient));

    // 1. SOCKET AUTH MIDDLEWARE (Requirement 2)

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; 
            next();
        } catch (err) {
            return next(new Error("Authentication error: Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`✅ Socket Connected: ${socket.user.id} (${socket.id})`);

        // 2. REGISTER HANDLERS (Requirement 1)
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
