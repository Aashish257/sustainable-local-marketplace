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
import messageRoutes from "./modules/message/message.routes.js";
import bidRoutes from "./modules/bid/bid.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";

const app = express();
// Behind Render/Cloudflare: read the real client IP from X-Forwarded-For (1 proxy hop)
app.set("trust proxy", 1);


// 1. SECURITY HARDENING (Requirement 4)
app.use(helmet()); // Secure HTTP headers
// CORS: CLIENT_URL may be a comma-separated list. In prod without it, block cross-origin calls instead of allowing "*"
const allowedOrigins = process.env.CLIENT_URL?.split(",").map((o) => o.trim());
app.use(cors({ origin: allowedOrigins || (process.env.NODE_ENV === "production" ? false : "*") }));
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

// Auth rate limit: strict in production, lenient in development
const authLimiter = rateLimit({
    windowMs: process.env.NODE_ENV === "production" ? 60 * 60 * 1000 : 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 5 : 50,
    message: { success: false, error: "Too many login attempts. Please try again later." }
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

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
app.use("/api/messages", messageRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

export default app;