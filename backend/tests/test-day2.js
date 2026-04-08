import fetch from "node-fetch";

const API_URL = "http://localhost:5000/api";

const generateRandomEmail = () => `test_${Date.now()}_${Math.random()}@example.com`;

async function runTests() {
    console.log("🚀 Starting Day 2 Tests...\n");
    let passed = 0;
    let failed = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ ${message}`);
            passed++;
        } else {
            console.log(`❌ ${message}`);
            failed++;
        }
    };

    const buyerEmail = generateRandomEmail();
    const password = "password123";

    try {
        console.log("--- Auth Tests ---");
        // Register buyer
        const regBuyerRes = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test Buyer", email: buyerEmail, password })
        });
        assert(regBuyerRes.status === 201, "Buyer registration creates user");

        // Login buyer
        const loginBuyerRes = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: buyerEmail, password })
        });
        const loginBuyerData = await loginBuyerRes.json();
        assert(loginBuyerRes.status === 200 && loginBuyerData.data.token, "Buyer login returns token");
        const buyerToken = loginBuyerData.data.token;
        
        console.log("\n--- Protected /me Test ---");
        // /me with token
        const meRes = await fetch(`${API_URL}/users/me`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${buyerToken}` }
        });
        const meData = await meRes.json();
        assert(meRes.status === 200, "Access /me with valid token succeeds");
        assert(meData.data && !meData.data.password, "Password is NOT returned in /me");
        assert(meData.data && meData.data.email === buyerEmail, "Correct user profile returned");

        // /me without token
        const meNoTokenRes = await fetch(`${API_URL}/users/me`);
        assert(meNoTokenRes.status === 401, "Access /me without token fails (401)");

        console.log("\n--- RBAC Tests ---");
        // /users with buyer
        const usersBuyerRes = await fetch(`${API_URL}/users`, {
            headers: { "Authorization": `Bearer ${buyerToken}` }
        });
        assert(usersBuyerRes.status === 403, "Buyer cannot access /users (403 Forbidden)");

        console.log("\n--- Edge Cases ---");
        // invalid token
        const invalidRes = await fetch(`${API_URL}/users/me`, {
            headers: { "Authorization": `Bearer invalid.token.value` }
        });
        assert(invalidRes.status === 401, "Invalid token fails (401 code from our auth update)");

        console.log(`\n🎉 Passed: ${passed} | ❌ Failed: ${failed}`);
        process.exit(failed > 0 ? 1 : 0);
    } catch (err) {
        console.error("Test error:", err);
        process.exit(1);
    }
}

runTests();
