/**
 * Review API Test Runner
 * Uses mongodb-memory-server so NO local MongoDB install needed.
 * Run: node tests/review-tests.js
 */

import "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import { Product } from "../src/models/product.model.js";
import { Order } from "../src/models/order.model.js";
import { Review } from "../src/models/review.model.js";

let mongod;
let server;
const BASE_URL = "http://localhost:5002"; 
const results = [];

function log(label, status, body, expected) {
    const pass = status === expected;
    const icon = pass ? "✅ PASS" : "❌ FAIL";
    results.push({ label, status, pass });
    console.log(`\n${icon}  ${label}`);
    console.log(`   Expected Status: ${expected} | Got: ${status}`);
    console.log(`   Response: ${JSON.stringify(body)}`);
}

async function post(path, body, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return { status: res.status, data };
}

async function get(path) {
    const res = await fetch(`${BASE_URL}${path}`);
    const data = await res.json();
    return { status: res.status, data };
}

async function setup() {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    server = app.listen(5002);
    await new Promise((r) => setTimeout(r, 500));
}

async function teardown() {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
}

async function runTests() {
    console.log("\n🚀 RUNNING REVIEW SYSTEM TESTS\n" + "═".repeat(40));

    // 1. Setup Data: Register Buyer and Seller
    await post("/api/auth/register", { name: "Buyer One", email: "buyer@test.com", password: "password", role: "buyer" });
    await post("/api/auth/register", { name: "Seller One", email: "seller@test.com", password: "password", role: "seller" });

    // Get the objects for product creation
    const buyer = await User.findOne({ email: "buyer@test.com" });
    const seller = await User.findOne({ email: "seller@test.com" });

    const product = await Product.create({ 
        title: "Eco Bottle", 
        price: 20, 
        sellerId: seller._id, 
        category: "Home", 
        stock: 10 
    });

    // Login to get token
    const loginRes = await post("/api/auth/login", { email: "buyer@test.com", password: "password" });
    console.log("Login Response:", JSON.stringify(loginRes));
    const token = loginRes.data.data.token;


    // TEST 1 — Post review WITHOUT purchase (Should FAIL)
    {
        const { status, data } = await post("/api/reviews", {
            productId: product._id,
            rating: 5,
            comment: "Great eco-friendly bottle!"
        }, token);
        log("TEST 1 — Create Review WITHOUT Purchase", status, data, 500); // 500 if using standard error handler with throw Error
    }

    // 2. Create a PAID order
    await Order.create({
        buyerId: buyer._id,
        status: "paid",
        items: [{ productId: product._id, quantity: 1, price: 20 }],
        totalAmount: 20
    });

    // TEST 2 — Post review WITH purchase (Should SUCCEED)
    {
        const { status, data } = await post("/api/reviews", {
            productId: product._id,
            rating: 4,
            comment: "Really good quality bottle!"
        }, token);
        log("TEST 2 — Create Review WITH Purchase", status, data, 201);
    }

    // TEST 3 — Duplicate review (Should FAIL)
    {
        const { status, data } = await post("/api/reviews", {
            productId: product._id,
            rating: 4,
            comment: "Wait, I already reviewed this."
        }, token);
        log("TEST 3 — Create Duplicate Review", status, data, 500);
    }

    // TEST 4 — Get Reviews
    {
        const { status, data } = await get(`/api/reviews/${product._id}`);
        log("TEST 4 — Fetch Product Reviews", status, data, 200);
    }

    // TEST 5 — Verify Product Rating Update
    {
        const updatedProduct = await Product.findById(product._id);
        const pass = updatedProduct.totalReviews === 1 && updatedProduct.averageRating === 4;
        log("TEST 5 — Verify Product Rating Update", pass ? 1 : 0, updatedProduct, 1);
    }
}

(async () => {
    try {
        await setup();
        await runTests();
        console.log("\n" + "═".repeat(40) + "\n   FINISH\n" + "═".repeat(40));
    } catch (err) {
        console.error(err);
    } finally {
        await teardown();
        process.exit(0);
    }
})();
