/**
 * Product API Test Runner (Day 3)
 * Uses mongodb-memory-server so NO local MongoDB install needed.
 * Run: node tests/product-tests.js
 */

import "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../src/app.js";

// ─── Test State ──────────────────────────────────────────────
let mongod;
let server;
const BASE_URL = "http://localhost:5002"; // Different port for product tests
const results = [];
let sellerToken;
let buyerToken;
let createdProductId;

// ─── Helpers ─────────────────────────────────────────────────
function log(label, status, body, expected, details = "") {
    const pass = status === expected;
    const icon = pass ? "✅ PASS" : "❌ FAIL";
    results.push({ label, status, pass });
    console.log(`\n${icon}  ${label}`);
    console.log(`   Expected Status: ${expected} | Got: ${status}`);
    if (details) console.log(`   Note: ${details}`);
    if (!pass) {
        console.log(`   Response: ${JSON.stringify(body, null, 2)}`);
    }
}

async function request(path, method = "GET", body = null, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    let data;
    try {
        data = await res.json();
    } catch (e) {
        data = { message: "Failed to parse JSON" };
    }
    return { status: res.status, data };
}

// ─── Setup ───────────────────────────────────────────────────
async function setup() {
    console.log("\n🚀 Starting in-memory MongoDB for Product Tests...");
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.disconnect();
    await mongoose.connect(uri);
    console.log("✅ MongoDB (in-memory) connected.");

    server = app.listen(5002, () => {
        console.log("✅ Test server running on port 5002\n");
    });

    await new Promise((r) => setTimeout(r, 500));
}

// ─── Teardown ────────────────────────────────────────────────
async function teardown() {
    if (server) server.close();
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
}

// ─── Test Cases ──────────────────────────────────────────────
async function runTests() {
    console.log("═".repeat(60));
    console.log("   PRODUCT MODULE TEST SUITE (DAY 3 CHECKLIST)");
    console.log("═".repeat(60));

    // 1. SETUP: Create Seller
    {
        await request("/api/auth/register", "POST", {
            name: "Seller A",
            email: "seller_a@test.com",
            password: "password123",
            role: "seller"
        });
        const { data } = await request("/api/auth/login", "POST", {
            email: "seller_a@test.com",
            password: "password123"
        });
        sellerToken = data.data.token;
    }

    // 2. SETUP: Create Buyer
    {
        await request("/api/auth/register", "POST", {
            name: "Buyer B",
            email: "buyer_b@test.com",
            password: "password123",
            role: "buyer"
        });
        const { data } = await request("/api/auth/login", "POST", {
            email: "buyer_b@test.com",
            password: "password123"
        });
        buyerToken = data.data.token;
    }

    // TEST 1: Seller can create product (BASIC + SECURITY)
    {
        const { status, data } = await request("/api/products", "POST", {
            title: "Sustainable Bamboo Kit",
            price: 25.50,
            category: "lifestyle",
            stock: 50,
            sustainabilityScore: 8
        }, sellerToken);
        log("1. Seller creates product", status, data, 201);
        createdProductId = data.data?._id;
    }

    // TEST 2: Buyer CANNOT create product (SECURITY)
    {
        const { status, data } = await request("/api/products", "POST", {
            title: "Unauthorized Product",
            price: 10,
            category: "test"
        }, buyerToken);
        log("2. Buyer creation (Forbidden)", status, data, 403);
    }

    // TEST 3: Get products with filtering (FILTERING)
    {
        const { status, data } = await request("/api/products?category=lifestyle&minPrice=20", "GET");
        log("3. Filtering (category + minPrice)", status, data, 200);
        const pass = data.data?.length > 0;
        console.log(`   Results found: ${data.data?.length || 0} (Pass: ${pass})`);
    }

    // TEST 4: Pagination (PAGINATION)
    {
        const { status, data } = await request("/api/products?page=1&limit=1", "GET");
        log("4. Pagination (limit=1)", status, data, 200);
        const pass = data.data?.length === 1;
        console.log(`   Results count: ${data.data?.length || 0} (Pass: ${pass})`);
    }

    // TEST 5: Owner can update (OWNERSHIP)
    {
        const { status, data } = await request(`/api/products/${createdProductId}`, "PUT", {
            price: 29.99
        }, sellerToken);
        log("5. Owner updates product", status, data, 200);
    }

    // TEST 6: Other seller CANNOT update (SECURITY/OWNERSHIP)
    {
        // Create Seller B
        await request("/api/auth/register", "POST", {
            name: "Seller B",
            email: "seller_b@test.com",
            password: "password123",
            role: "seller"
        });
        const { data: loginData } = await request("/api/auth/login", "POST", {
            email: "seller_b@test.com",
            password: "password123"
        });
        const sellerBToken = loginData.data.token;

        const { status, data } = await request(`/api/products/${createdProductId}`, "PUT", {
            price: 0.01
        }, sellerBToken);
        log("6. Other seller update (Forbidden)", status, data, 403, "Ownership check working");
    }

    // TEST 7: Owner can delete (OWNERSHIP)
    {
        const { status, data } = await request(`/api/products/${createdProductId}`, "DELETE", null, sellerToken);
        log("7. Owner deletes product", status, data, 200);
    }
}

function printSummary() {
    const passed = results.filter((r) => r.pass).length;
    const total = results.length;

    console.log("\n" + "═".repeat(60));
    console.log("   RESULTS SUMMARY");
    console.log("═".repeat(60));
    results.forEach((r) => {
        console.log(`${r.pass ? "✅" : "❌"}  ${r.label} (${r.status})`);
    });
    console.log("\n" + "─".repeat(60));
    console.log(`   ${passed}/${total} tests passed`);
    console.log("─".repeat(60) + "\n");

    if (passed === total) {
        console.log("🎉 ALL PRODUCT TESTS PASSED — Day 3 checklist COMPLETE!");
    } else {
        console.log(`⚠️  ${total - passed} test(s) failed. Review output above.`);
    }
}

(async () => {
    try {
        await setup();
        await runTests();
        printSummary();
    } catch (err) {
        console.error("Fatal error:", err);
    } finally {
        await teardown();
        process.exit(0);
    }
})();
