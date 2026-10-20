// Step 3 check: idempotency + oversell guard in verifyPaymentService.
// Run from backend/: node tests/step3-stock-test.mjs  (creates temp docs, deletes them after)
import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../src/models/product.model.js";
import { Order } from "../src/models/order.model.js";
import { verifyPaymentService } from "../src/modules/payment/payment.service.js";

const pay = (orderId) =>
  verifyPaymentService({ orderId, razorpay_order_id: "order_test_x", razorpay_payment_id: "pay_test_x", razorpay_signature: "mock_x" })
    .then((o) => `200 ${o.status}`)
    .catch((e) => `${e.status || 500} ${e.message}`);

await mongoose.connect(process.env.MONGO_URI);
const sellerId = new mongoose.Types.ObjectId();
const p = await Product.create({ title: "STEP3 TEST", description: "temporary test item", price: 10, sellerId, category: "test", stock: 1, sustainabilityScore: 5 });
const mk = () => Order.create({ buyerId: new mongoose.Types.ObjectId(), items: [{ productId: p._id, quantity: 1, price: 10 }], totalAmount: 10 });
const [a, b] = [await mk(), await mk()];

try {
  console.log("1. buyer A pays          ->", await pay(a._id), "| stock:", (await Product.findById(p._id)).stock);
  console.log("2. buyer A pays again    ->", await pay(a._id));
  console.log("3. buyer B pays (stock 0)->", await pay(b._id));
  const bb = await Order.findById(b._id);
  console.log("   order B:", bb.status, "refundStatus:", bb.refundStatus, "| stock:", (await Product.findById(p._id)).stock);
} finally {
  await Order.deleteMany({ _id: { $in: [a._id, b._id] } });
  await Product.deleteOne({ _id: p._id });
  await mongoose.disconnect();
  process.exit(0);
}
