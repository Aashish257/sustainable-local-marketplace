// Step 5 check: atomic bidding under concurrency (FR-4.3).
// Run from backend/: node tests/step5-bid-test.mjs  (creates temp docs, deletes them after)
import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../src/models/product.model.js";
import { Bid } from "../src/models/bid.model.js";
import { Notification } from "../src/models/notification.model.js";
import { placeBid } from "../src/modules/bid/bid.service.js";

const id = () => new mongoose.Types.ObjectId();
const tryBid = (productId, amount) =>
  placeBid({ productId, userId: id(), amount }).then(() => "ok").catch((e) => e.status || 500);
const count = (arr) => arr.reduce((m, r) => ((m[r] = (m[r] || 0) + 1), m), {});

await mongoose.connect(process.env.MONGO_URI);
const base = { description: "temporary test item", price: 50, sellerId: id(), category: "test", stock: 1, sustainabilityScore: 5, isApproved: true };
const p = await Product.create({ ...base, title: "STEP5 AUCTION", biddingEnabled: true, biddingStartingPrice: 100 });
const off = await Product.create({ ...base, title: "STEP5 NO BID" });
const ended = await Product.create({ ...base, title: "STEP5 ENDED", biddingEnabled: true, biddingEndTime: new Date(Date.now() - 1000) });

try {
  const same = await Promise.all(Array.from({ length: 10 }, () => tryBid(p._id, 150)));
  console.log("1. 10 parallel bids of 150     ->", count(same), "(want 1 ok, 9×409)");
  const rising = await Promise.all(Array.from({ length: 10 }, (_, i) => tryBid(p._id, 160 + i * 10)));
  const prod = await Product.findById(p._id);
  console.log("2. 10 parallel bids 160..250   -> currentBid", prod.currentBid, "(want 250)");
  console.log("3. equal bid 250               ->", await tryBid(p._id, 250), "(want 409)");
  console.log("4. bid below starting price    ->", await tryBid(p._id, 90), "(want 400)");
  console.log("5. bidding not enabled         ->", await tryBid(off._id, 999), "(want 400)");
  console.log("6. auction ended               ->", await tryBid(ended._id, 999), "(want 400)");
  const top = await Bid.findOne({ productId: p._id }).sort({ amount: -1 });
  console.log("7. top Bid doc matches product ->", top.amount === prod.currentBid, `(bids saved: ${await Bid.countDocuments({ productId: p._id })})`);
} finally {
  await new Promise((r) => setTimeout(r, 500)); // let fire-and-forget outbid notifications finish
  await Notification.deleteMany({ link: { $in: [p, off, ended].map((x) => `/products/${x._id}`) } });
  await Bid.deleteMany({ productId: { $in: [p._id, off._id, ended._id] } });
  await Product.deleteMany({ _id: { $in: [p._id, off._id, ended._id] } });
  await mongoose.disconnect();
  process.exit(0);
}
