// Notifications check: API + events that create them + live socket push.
// Run from backend/ with the API running:  API=http://localhost:5055 node tests/notification-test.mjs
// Creates temp users/products/orders (emails start with "ntf_") and deletes them after.
import "dotenv/config";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { io as connect } from "socket.io-client";
import User from "../src/models/user.model.js";
import { Product } from "../src/models/product.model.js";
import { Order } from "../src/models/order.model.js";
import { Bid } from "../src/models/bid.model.js";
import { Notification } from "../src/models/notification.model.js";

const API = (process.env.API || "http://localhost:5055") + "/api";
const tag = Date.now();
const check = (label, got, want) => console.log(`${got === want ? "PASS" : "FAIL"}  ${label} -> ${got} (want ${want})`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tokenFor = (u) => jwt.sign({ id: u._id.toString(), role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: "5m" });
const call = async (method, path, body, token) => {
  const res = await fetch(API + path, {
    method, body: body && JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const mine = async (u) => (await call("GET", "/notifications", null, tokenFor(u))).body.data;

await mongoose.connect(process.env.MONGO_URI);
let n = 0;
const mkUser = (role) => User.create({ name: `NTF ${role}`, email: `ntf_${role}${++n}_${tag}@test.com`, password: "x", role });
const [buyer, buyer2, seller] = [await mkUser("buyer"), await mkUser("buyer"), await mkUser("seller")];
const users = [buyer._id, buyer2._id, seller._id];
const products = [], orders = [];

try {
  // ---- live push: buyer watches their own room ----
  const socket = connect(API.replace("/api", ""), { auth: { token: tokenFor(buyer) }, transports: ["websocket"] });
  const pushed = [];
  socket.on("notification", (n) => pushed.push(n));
  await new Promise((r) => socket.on("connect", r));

  // ---- outbid: buyer leads, buyer2 outbids ----
  const p = await Product.create({ title: `NTF Lamp ${tag}`, description: "temporary notification test", price: 50, sellerId: seller._id,
    category: "test", stock: 2, sustainabilityScore: 5, isApproved: true, biddingEnabled: true, biddingStartingPrice: 100 });
  products.push(p._id);
  check("1a buyer bids (REST)", (await call("POST", "/bids", { productId: p._id, amount: 150 }, tokenFor(buyer))).status, 201);
  check("1b buyer2 outbids", (await call("POST", "/bids", { productId: p._id, amount: 200 }, tokenFor(buyer2))).status, 201);
  await sleep(500);
  const afterBid = await mine(buyer);
  check("1c buyer got 'outbid' notification", afterBid.items.some((n) => n.type === "bid" && /outbid/.test(n.message)), true);
  check("1d pushed live over socket", pushed.some((n) => /outbid/.test(n.message)), true);
  check("1e buyer2 (leader) got nothing", (await mine(buyer2)).items.length, 0);

  // ---- payment confirmed: buyer + seller ----
  const o = await Order.create({ buyerId: buyer._id, items: [{ productId: p._id, quantity: 1, price: 50 }], totalAmount: 50 });
  orders.push(o._id);
  const pay = await call("POST", "/payments/verify", { orderId: o._id.toString(), razorpay_order_id: "order_test_x", razorpay_payment_id: "pay_test_x", razorpay_signature: "mock_x" }, tokenFor(buyer));
  check("2a mock payment verified", pay.status, 200);
  check("2b buyer got 'payment received'", (await mine(buyer)).items.some((n) => n.type === "order" && /Payment received/.test(n.message)), true);
  check("2c seller got 'new paid order'", (await mine(seller)).items.some((n) => /New paid order/.test(n.message)), true);

  // ---- status change by seller ----
  check("3a seller marks shipped", (await call("PATCH", `/orders/${o._id}/status`, { status: "shipped" }, tokenFor(seller))).status, 200);
  check("3b buyer told 'now shipped'", (await mine(buyer)).items.some((n) => /now shipped/.test(n.message)), true);

  // ---- read / read-all / ownership / clear ----
  const list = await mine(buyer);
  check("4a unreadCount matches items", list.unreadCount, list.items.length);
  const first = list.items[0]._id;
  check("4b other user cannot mark it read", (await call("PATCH", `/notifications/${first}/read`, null, tokenFor(buyer2))).status, 404);
  check("4c bad id -> 400", (await call("PATCH", "/notifications/abc/read", null, tokenFor(buyer))).status, 400);
  check("4d owner marks one read", (await call("PATCH", `/notifications/${first}/read`, null, tokenFor(buyer))).status, 200);
  check("4e unread count drops by 1", (await mine(buyer)).unreadCount, list.items.length - 1);
  await call("PATCH", "/notifications/read-all", null, tokenFor(buyer));
  check("4f read-all -> 0 unread", (await mine(buyer)).unreadCount, 0);
  check("4g no token -> 401", (await call("GET", "/notifications")).status, 401);
  await call("DELETE", "/notifications", null, tokenFor(buyer));
  check("4h clear-all empties list", (await mine(buyer)).items.length, 0);
  socket.close();
} finally {
  await Notification.deleteMany({ userId: { $in: users } });
  await Bid.deleteMany({ productId: { $in: products } });
  await Order.deleteMany({ _id: { $in: orders } });
  await Product.deleteMany({ _id: { $in: products } });
  await User.deleteMany({ _id: { $in: users } });
  await mongoose.disconnect();
  process.exit(0);
}
