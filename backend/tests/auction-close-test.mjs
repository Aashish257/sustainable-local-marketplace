// Auction close check: service rules + live 'auction_closed' socket event.
// Part A needs only MongoDB. Part B needs the API running with a fast sweep:
//   AUCTION_SWEEP_MS=1000 PORT=5055 node src/server.js
//   API=http://localhost:5055 node tests/auction-close-test.mjs
// Creates temp products (title starts with "AUCTION TEST") and deletes them after.
import "dotenv/config";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { io as connect } from "socket.io-client";
import { Product } from "../src/models/product.model.js";
import { Bid } from "../src/models/bid.model.js";
import { placeBid, closeExpiredAuctions } from "../src/modules/bid/bid.service.js";

const id = () => new mongoose.Types.ObjectId();
const check = (label, got, want) => console.log(`${got === want ? "PASS" : "FAIL"}  ${label} -> ${got} (want ${want})`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = { description: "temporary auction test item", price: 50, sellerId: id(), category: "test", stock: 1,
  sustainabilityScore: 5, isApproved: true, biddingEnabled: true, biddingStartingPrice: 100 };

await mongoose.connect(process.env.MONGO_URI);
const created = [];
const make = async (extra) => { const p = await Product.create({ ...base, title: "AUCTION TEST", ...extra }); created.push(p._id); return p; };

try {
  // ---- Part A: closeExpiredAuctions rules ----
  const winner = id();
  const a = await make({ biddingEndTime: new Date(Date.now() + 1500) });
  await placeBid({ productId: a._id, userId: id(), amount: 150 });
  await placeBid({ productId: a._id, userId: winner, amount: 200 });
  const noBids = await make({ biddingEndTime: new Date(Date.now() - 1000) });
  await sleep(1600); // let auction A expire

  // 3 sweeps at once (like 3 servers): each auction must close exactly once
  const runs = await Promise.all([closeExpiredAuctions(), closeExpiredAuctions(), closeExpiredAuctions()]);
  const mine = runs.flat().filter((p) => created.some((c) => c.equals(p._id)));
  const ids = mine.map((p) => p._id.toString());
  check("A1 parallel sweeps never close an auction twice", new Set(ids).size === ids.length, true);
  const A = await Product.findById(a._id);
  check("A2 auction closed", A.auctionClosed, true);
  check("A3 winner is highest bidder", A.auctionWinner?.toString(), winner.toString());
  check("A4 no-bid auction has no winner", (await Product.findById(noBids._id)).auctionWinner, null);
  const again = (await closeExpiredAuctions()).filter((p) => created.some((c) => c.equals(p._id)));
  check("A5 second sweep closes nothing", again.length, 0);
  const late = await placeBid({ productId: a._id, userId: id(), amount: 999 }).then(() => 200).catch((e) => e.status);
  check("A6 bid after close rejected", late, 400);

  // ---- Part B: live socket event from the running server ----
  if (process.env.API) {
    const token = jwt.sign({ id: id().toString(), role: "buyer" }, process.env.JWT_SECRET, { expiresIn: "5m" });
    const b = await make({ biddingEndTime: new Date(Date.now() + 2000) });
    const socket = connect(process.env.API, { auth: { token }, transports: ["websocket"] });
    const event = new Promise((resolve) => {
      socket.on("auction_closed", (d) => d.productId === b._id.toString() && resolve(d));
      setTimeout(() => resolve(null), 8000);
    });
    socket.on("connect", () => socket.emit("join_product", b._id.toString()));
    const got = await event;
    socket.close();
    check("B1 'auction_closed' event received by watcher", !!got, true);
    check("B2 event has no winner (no bids)", got?.winnerId ?? null, null);
  } else {
    console.log("SKIP  Part B (set API=http://localhost:5055 with the server running)");
  }
} finally {
  await Bid.deleteMany({ productId: { $in: created } });
  await Product.deleteMany({ _id: { $in: created } });
  await mongoose.disconnect();
  process.exit(0);
}
