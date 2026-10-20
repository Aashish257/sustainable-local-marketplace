// One-time migration: products created before moderation existed are marked approved + active,
// so they stay visible in the catalog. Safe to re-run (only touches docs missing the fields).
// Run from backend/: node src/scripts/backfill-approval.js
import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

await mongoose.connect(process.env.MONGO_URI);
const approved = await Product.updateMany({ isApproved: { $exists: false } }, { $set: { isApproved: true } });
const active = await Product.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } });
console.log(`isApproved set on ${approved.modifiedCount} products, isActive set on ${active.modifiedCount}`);
await mongoose.disconnect();
