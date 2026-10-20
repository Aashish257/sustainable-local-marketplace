import express from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import { 
    getSystemStats, 
    getAllUsers, 
    getAllProducts, 
    getAllOrders,
    updateUserRole,
    deleteUser,
    deleteProductAdmin,
    setProductApproval,
    updateOrderStatusAdmin
} from "./admin.controller.js";

const router = express.Router();

// All admin routes are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get("/stats", getSystemStats);
router.get("/users", getAllUsers);
router.get("/products", getAllProducts);
router.get("/orders", getAllOrders);

router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.delete("/products/:id", deleteProductAdmin);
router.patch("/products/:id/approval", setProductApproval);
router.patch("/orders/:id/status", updateOrderStatusAdmin);

export default router;
