// Step 4 check: no mock bypass in production + timing-safe HMAC compare.
// Run from backend/: node tests/step4-signature-test.mjs  (no DB needed)
import crypto from "crypto";
process.env.NODE_ENV = "production";
process.env.RAZORPAY_KEY_ID = "rzp_test_realLookingKey";
process.env.RAZORPAY_KEY_SECRET = "step4_secret";
const { verifyPaymentService } = await import("../src/modules/payment/payment.service.js");

const run = (sig, oid = "order_ABC") =>
  verifyPaymentService({ razorpay_order_id: oid, razorpay_payment_id: "pay_1", razorpay_signature: sig })
    .then(() => "200").catch((e) => `${e.status || 500} ${e.message}`);

const good = crypto.createHmac("sha256", "step4_secret").update("order_ABC|pay_1").digest("hex");
console.log("1. mock_ signature in prod ->", await run("mock_x"));
console.log("2. order_test_ id in prod  ->", await run("mock_x", "order_test_1"));
console.log("3. short forged signature  ->", await run("abc"));
console.log("4. valid HMAC              ->", await run(good), "(past signature check = OK)");
process.exit(0);
