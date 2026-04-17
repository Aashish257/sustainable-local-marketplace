import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/index.js";
import "./workers/notification.worker.js"; // Start background worker (Requirement 3)


const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// 1. Wrap Express app with HTTP server (Requirement 1)
const server = http.createServer(app);

// 2. Initialize Sockets
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});