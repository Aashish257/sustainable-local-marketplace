// Seeds (or resets) the public demo: demo accounts + the demo seller's products.
// Safe to re-run: only demo data is replaced; the owner admin and real users are kept.
// Usage: MONGO_URI=... node src/scripts/seed.js   (also run nightly by .github/workflows/reset-demo.yml)
import mongoose from "mongoose";
import dotenv from "dotenv";
import { resetDemoData, DEMO_PRODUCTS } from "./demo-data.js";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
    console.error("✖ Set MONGO_URI.");
    process.exit(1);
}

try {
    await mongoose.connect(uri);
    const users = await resetDemoData();
    console.log(`✔ Demo reset: ${Object.keys(users).length} demo accounts, ${DEMO_PRODUCTS.length} products.`);
    await mongoose.disconnect();
} catch (err) {
    console.error("✖ Demo reset failed:", err.message);
    process.exit(1);
}
