import express from "express";
import { getChatHistory } from "./message.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/messages/:receiverId — Private
router.get("/:receiverId", protect, getChatHistory);

export default router;
