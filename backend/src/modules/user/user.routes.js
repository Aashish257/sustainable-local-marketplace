import express from "express";
import { getProfile, getUsers } from "./user.controller.js";
import { protect, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Route: GET /api/users/me
// Access: Protected (must be logged in);
router.get("/me", protect, getProfile);

// Route: GET /api/users
// Access: Protected (Admin only);
router.get("/", protect, authorize("admin"), getUsers);

export default router;
