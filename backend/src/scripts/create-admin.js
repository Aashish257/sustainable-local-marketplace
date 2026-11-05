// Creates (or updates) the owner's private, full-access admin account.
// Usage: MONGO_URI=... ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... node src/scripts/create-admin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import { hashPassword } from "../utils/hash.js";

dotenv.config();

const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

const fail = (msg) => {
    console.error(`✖ ${msg}`);
    process.exit(1);
};

if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
    fail("Set MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME.");
}
if (ADMIN_PASSWORD.length < 12) fail("ADMIN_PASSWORD must be at least 12 characters.");

await mongoose.connect(MONGO_URI);
const email = ADMIN_EMAIL.trim().toLowerCase();
await User.findOneAndUpdate(
    { email },
    {
        name: ADMIN_NAME,
        email,
        password: await hashPassword(ADMIN_PASSWORD),
        role: "admin",
        isDemo: false,
        isActive: true,
        consentGiven: true,
        consentAt: new Date(),
        $inc: { tokenVersion: 1 }, // sign out any old sessions for this account
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
);
console.log(`✔ Admin ready: ${email}`);
await mongoose.disconnect();
