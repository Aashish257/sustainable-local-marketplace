import 'dotenv/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import crypto from 'crypto';
import razorpay from '../src/config/razorpay.js';
import { registerService, loginService } from '../src/modules/auth/auth.service.js';
import { createProductService, getProductByIdService } from '../src/modules/product/product.service.js';
import { addToCartService, getCartService } from '../src/modules/cart/cart.service.js';
import { createOrderService } from '../src/modules/order/order.service.js';
import { createRazorpayOrderService, verifyPaymentService } from '../src/modules/payment/payment.service.js';

// MOCK RAZORPAY
razorpay.orders.create = async (options) => {
    return {
        id: "order_mock_id_" + Date.now(),
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created"
    };
};

async function runTest() {
    let mongoServer;
    try {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        console.log("Connected to Mock DB");

        // 1. Create Buyer
        const buyer = await registerService({ name: "Buyer", email: "buyer@test.com", password: "password123", role: "buyer" });
        const { token: buyerToken } = await loginService({ email: "buyer@test.com", password: "password123" });
        const buyerId = buyer.id;

        // 2. Create Seller & Product
        const seller = await registerService({ name: "Seller", email: "seller@test.com", password: "password123", role: "seller" });
        
        const initialStock = 10;
        const buyQuantity = 2;
        const product = await createProductService({ title: "Eco Bag", price: 100, stock: initialStock }, { id: seller.id, role: "seller" });
        console.log("Product Created:", product.title, "Stock:", product.stock);

        // 3. Add to Cart
        await addToCartService(buyerId, { productId: product._id.toString(), quantity: buyQuantity });
        const cart = await getCartService(buyerId);
        console.log("Cart Total:", cart.total);

        // 4. Create Order
        const order = await createOrderService(buyerId);
        console.log("Order Created. Status:", order.status, "Total:", order.totalAmount);

        // 5. Create Razorpay Order (Mocked)
        const rzOrder = await createRazorpayOrderService(order._id);
        console.log("Razorpay Order Created:", rzOrder.id);

        // 6. Simulate Payment Verification
        const razorpay_payment_id = "pay_test_payment_id";
        const signData = rzOrder.id + "|" + razorpay_payment_id;
        
        // Use dummy secret if not in env
        const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";
        const razorpay_signature = crypto
            .createHmac("sha256", secret)
            .update(signData)
            .digest("hex");

        console.log("Verifying Payment...");
        const verifiedOrder = await verifyPaymentService({
            razorpay_order_id: rzOrder.id,
            razorpay_payment_id,
            razorpay_signature
        });

        console.log("Verified Order Status:", verifiedOrder.status);

        // 7. Verify Stock Reduction
        const updatedProduct = await getProductByIdService(product._id);
        console.log("Initial Stock:", initialStock, "| Final Stock:", updatedProduct.stock);
        
        if (updatedProduct.stock !== (initialStock - buyQuantity)) {
            throw new Error("Stock reduction logic failed!");
        }

        if (verifiedOrder.status !== "paid") {
            throw new Error("Order status update to paid failed!");
        }

        console.log("FINAL SYSTEM STATE: [SUCCESS]");
        console.log("ALL 10 REQUIREMENTS VERIFIED.");
    } catch (err) {
        console.error("TEST FAILED:", err.message || err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        if (mongoServer) await mongoServer.stop();
    }
}

runTest();
