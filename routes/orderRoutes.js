// routes/orderRoutes.js
import express from "express";
import { createOrder, getPendingOrders, updateOrderStatus } from "../controllers/orderController.js";
import {
  createCustomerOrder,
  getCustomerOrders,
  cancelCustomerOrder,
} from "../controllers/customerOrderController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order and receipt (staff/manual entry)
 * @access  Protected — cashier, manager, admin, waiter
 */
router.post("/", protect, authorize("cashier", "manager", "admin", "waiter"), createOrder);

router.get("/pending", protect, getPendingOrders);
router.patch("/:id/status", protect, authorize("kitchen", "manager", "admin"), updateOrderStatus);

/**
 * Customer-facing routes — guest session, no login required
 */
router.post("/customer", createCustomerOrder);
router.get("/customer", getCustomerOrders);
router.patch("/customer/:id/cancel", cancelCustomerOrder);

export default router;
