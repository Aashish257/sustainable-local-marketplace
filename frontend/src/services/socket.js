import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

/**
 * Singleton Socket Instance
 * - Created ONCE, never inside a component.
 * - autoConnect: false → we manually connect after login.
 */
const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

/**
 * Call this when the user logs in.
 * Attaches the JWT token to the socket auth and connects.
 */
export const connectSocket = (token) => {
    if (!token) return;
    socket.auth = { token };
    if (!socket.connected) {
        socket.connect();
    }
};

/**
 * Call this when the user logs out.
 * Cleanly disconnects the socket.
 */
export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

// Global socket event listeners for debugging
socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
    console.error("🔌 Socket connection error:", err.message);
});

export default socket;
