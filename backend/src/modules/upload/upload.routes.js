import express from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import { createUploadSignature } from "./upload.service.js";

const router = express.Router();

// POST /api/uploads/signature -> params the browser needs to upload one image to Cloudinary
router.post("/signature", protect, authorize("seller", "admin"), (req, res, next) => {
    try {
        res.json({ success: true, data: createUploadSignature(req.user.id) });
    } catch (err) {
        next(err);
    }
});

export default router;
