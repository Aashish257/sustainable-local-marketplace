import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { getNotifications, readOne, readAll, removeAll } from "./notification.controller.js";

const router = express.Router();
router.use(protect);

router.get("/", getNotifications);          // ?page=1&limit=20 -> { items, unreadCount }
router.patch("/read-all", readAll);         // must be before /:id/read
router.patch("/:id/read", readOne);
router.delete("/", removeAll);

export default router;
