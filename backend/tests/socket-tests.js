/**
 * Socket.io Integration Test Runner
 * Run: node tests/socket-tests.js
 */

import "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import http from "http";
import { io as Client } from "socket.io-client";
import app from "../src/app.js";
import { initSocket } from "../src/socket/index.js";
import User from "../src/models/user.model.js";
import { Product } from "../src/models/product.model.js";
import { Message } from "../src/models/message.model.js";
import { Bid } from "../src/models/bid.model.js";
import { generateToken } from "../src/utils/jwt.js";

let mongod;
let httpServer;
let ioServer;
const PORT = 5003;
const BASE_URL = `http://localhost:${PORT}`;

async function setup() {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    httpServer = http.createServer(app);
    ioServer = initSocket(httpServer);
    await new Promise((r) => httpServer.listen(PORT, r));
}

async function teardown() {
    ioServer.close();
    httpServer.close();
    await mongoose.disconnect();
    await mongod.stop();
}

function createClient(token) {
    return new Client(BASE_URL, {
        auth: { token }
    });
}

async function runTests() {
    console.log("\n🚀 RUNNING SOCKET.IO SYSTEM TESTS\n" + "═".repeat(40));

    // 1. Setup Data
    const userA = await User.create({ name: "User A", email: "a@test.com", password: "password", role: "buyer" });
    const userB = await User.create({ name: "User B", email: "b@test.com", password: "password", role: "buyer" });
    const seller = await User.create({ name: "Seller", email: "s@test.com", password: "password", role: "seller" });
    const product = await Product.create({ title: "Art Piece", price: 100, sellerId: seller._id });

    const tokenA = generateToken({ id: userA._id, role: userA.role });
    const tokenB = generateToken({ id: userB._id, role: userB.role });

    // TEST 1: Connection & Auth
    const clientA = createClient(tokenA);
    const clientB = createClient(tokenB);

    await new Promise((resolve, reject) => {
        clientA.on("connect", resolve);
        clientA.on("connect_error", reject);
    });
    console.log("✅ TEST 1: Connection & Auth - PASSED");

    // TEST 2: Chat (Requirement 4)
    await new Promise((resolve) => {
        const msgText = "Hey User B!";
        
        clientB.on("receive_message", async (data) => {
            if (data.message === msgText) {
                console.log("✅ TEST 2: Chat Message Received - PASSED");
                
                // Verify DB Persistence (Requirement 6)
                const saved = await Message.findOne({ message: msgText });
                if (saved) console.log("   -> DB Persistence - PASSED");
                resolve();
            }
        });

        clientA.emit("send_message", { receiverId: userB._id.toString(), message: msgText });
    });

    // TEST 3: Bidding (Requirement 5)
    await new Promise((resolve) => {
        clientA.emit("join_product", product._id.toString());
        clientB.emit("join_product", product._id.toString());

        clientB.on("new_bid", async (data) => {
            if (data.amount === 150) {
                console.log("✅ TEST 3: Bidding Broadcast - PASSED");
                
                // Verify Higher Bid Reject (Requirement 5)
                clientB.emit("place_bid", { productId: product._id.toString(), amount: 120 });
                clientB.on("bid_error", (err) => {
                    console.log(`   -> Bid Rejection (${err.message}) - PASSED`);
                    resolve();
                });
            }
        });

        clientA.emit("place_bid", { productId: product._id.toString(), amount: 150 });
    });

    clientA.close();
    clientB.close();
}

(async () => {
    try {
        await setup();
        await runTests();
        console.log("\n" + "═".repeat(40) + "\n   FINISH\n" + "═".repeat(40));
    } catch (err) {
        console.error("Test Failed:", err);
    } finally {
        await teardown();
        process.exit(0);
    }
})();
