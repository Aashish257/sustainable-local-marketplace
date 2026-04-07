import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({ success: true, message: "Sustainable Marketplace API is running" });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;