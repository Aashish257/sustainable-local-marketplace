import express from "express";
import { getChatHistory, getConversations, sendMessage } from "./message.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/messages/conversations — Private
router.get("/conversations", protect, getConversations);
router.get("/threads", protect, getConversations);

// POST /api/messages — Private (Send message)
router.post("/", protect, sendMessage);

// GET /api/messages/:receiverId — Private
router.get("/:receiverId", protect, getChatHistory);

export default router;

