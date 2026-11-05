import express from "express";
import { register, login, logout, getMe } from "./auth.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { registerSchema } from "./auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register); // readable 400 messages
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;