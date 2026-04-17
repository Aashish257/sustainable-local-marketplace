import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.middleware.js";
import logger from "./middleware/logger.middleware.js";

// Import Routes
import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";

const app = express();

// 1. SECURITY HARDENING (Requirement 4)
app.use(helmet()); // Secure HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL || "*" })); // Strict CORS (Change from * in prod)
app.use(express.json());

// 2. LOGGING (Requirement 7)
// Morgan for request logs, redirected through Winston
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

// 3. RATE LIMITING (Requirement 4)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { success: false, error: "Too many requests. Please try again later." }
});
app.use("/api", globalLimiter);

// Specific stricter limit for login (Requirement 4)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit login to 5 attempts per window
    message: { success: false, error: "Too many login attempts. Try again in an hour." }
});
app.use("/api/auth/login", authLimiter);

// 4. API ROUTES
app.get("/", (req, res) => {
    res.json({ success: true, message: "Sustainable Marketplace API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(errorHandler);

export default app;