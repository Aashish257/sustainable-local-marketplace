/**
 * Auth API Test Runner
 * Uses mongodb-memory-server so NO local MongoDB install needed.
 * Run: node tests/run-tests.js
 */

import "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../src/app.js";

// ─── Test State ──────────────────────────────────────────────
let mongod;
let server;
const BASE_URL = "http://localhost:5001";  // Use 5001 to avoid conflict
const results = [];

// ─── Helpers ─────────────────────────────────────────────────
function log(label, status, body, expected) {
    const pass = status === expected;
    const icon = pass ? "✅ PASS" : "❌ FAIL";
    results.push({ label, status, pass });
    console.log(`\n${icon}  ${label}`);
    console.log(`   Expected Status: ${expected} | Got: ${status}`);
    console.log(`   Response: ${JSON.stringify(body)}`);
}

async function post(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

// ─── Setup ───────────────────────────────────────────────────
async function setup() {
    console.log("\n🚀 Starting in-memory MongoDB...");
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Disconnect any existing connection and re-connect to memory server
    await mongoose.disconnect();
    await mongoose.connect(uri);
    console.log("✅ MongoDB (in-memory) connected:", uri);

    server = app.listen(5001, () => {
        console.log("✅ Test server running on port 5001\n");
    });

    // Wait for server to be ready
    await new Promise((r) => setTimeout(r, 500));
}

// ─── Teardown ────────────────────────────────────────────────
async function teardown() {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
}

// ─── Test Cases ──────────────────────────────────────────────
async function runTests() {
    console.log("═".repeat(55));
    console.log("   AUTH API TEST SUITE");
    console.log("═".repeat(55));

    // BONUS: Health Check
    {
        const { status, data } = await get("/");
        log("BONUS — Health Check (GET /)", status, data, 200);
    }

    // TEST 1: Register valid input
    {
        const { status, data } = await post("/api/auth/register", {
            name: "Aashish",
            email: "test@test.com",
            password: "123456",
        });
        log("TEST 1 — Register: Valid Input", status, data, 201);
    }

    // TEST 2: Login correct credentials
    {
        const { status, data } = await post("/api/auth/login", {
            email: "test@test.com",
            password: "123456",
        });
        log("TEST 2 — Login: Correct Credentials", status, data, 200);
    }

    // EDGE 1: Duplicate email
    {
        const { status, data } = await post("/api/auth/register", {
            name: "Aashish",
            email: "test@test.com",
            password: "123456",
        });
        log("EDGE 1 — Register: Duplicate Email", status, data, 400);
    }

    // EDGE 2: Wrong password
    {
        const { status, data } = await post("/api/auth/login", {
            email: "test@test.com",
            password: "wrongpassword",
        });
        log("EDGE 2 — Login: Wrong Password", status, data, 400);
    }

    // EDGE 3: Invalid email format
    {
        const { status, data } = await post("/api/auth/register", {
            name: "Aashish",
            email: "not-an-email",
            password: "123456",
        });
        log("EDGE 3 — Register: Invalid Email Format", status, data, 400);
    }

    // EDGE 4: Non-existent user
    {
        const { status, data } = await post("/api/auth/login", {
            email: "ghost@nobody.com",
            password: "123456",
        });
        log("EDGE 4 — Login: Non-existent User", status, data, 400);
    }
}

// ─── Summary ─────────────────────────────────────────────────
function printSummary() {
    const passed = results.filter((r) => r.pass).length;
    const total = results.length;

    console.log("\n" + "═".repeat(55));
    console.log("   RESULTS SUMMARY");
    console.log("═".repeat(55));
    results.forEach((r) => {
        console.log(`${r.pass ? "✅" : "❌"}  ${r.label} (${r.status})`);
    });
    console.log("\n" + "─".repeat(55));
    console.log(`   ${passed}/${total} tests passed`);
    console.log("─".repeat(55) + "\n");

    if (passed === total) {
        console.log("🎉 ALL TESTS PASSED — Day 1 checklist COMPLETE!");
    } else {
        console.log(`⚠️  ${total - passed} test(s) failed. Review output above.`);
    }
}

// ─── Main ────────────────────────────────────────────────────
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
