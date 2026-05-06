import express from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import { 
    getSystemStats, 
    getAllUsers, 
    getAllProducts, 
    getAllOrders 
} from "./admin.controller.js";

const router = express.Router();

// All admin routes are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get("/stats", getSystemStats);
router.get("/users", getAllUsers);
router.get("/products", getAllProducts);
router.get("/orders", getAllOrders);

export default router;
