// routes/receiptRoutes.js
import express from "express";
import { payReceipt, getReceipts, getReceiptsByWaiter } from "../controllers/receiptController.js";
import { protect, authorize } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.patch("/:id/pay", protect, authorize("admin", "manager", "cashier"), payReceipt);
router.get("/", protect, authorize("cashier", "manager", "admin"), getReceipts);
router.get("/waiter/:name", protect, getReceiptsByWaiter);

export default router;
