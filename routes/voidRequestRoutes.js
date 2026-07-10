// routes/voidRequestRoutes.js
import express from "express";
import {
  createVoidRequest,
  approveVoidRequest,
  rejectVoidRequest,
} from "../controllers/voidRequestController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("cashier", "manager", "admin"), createVoidRequest);
router.patch("/:id/approve", protect, authorize("manager", "admin"), approveVoidRequest);
router.patch("/:id/reject", protect, authorize("manager", "admin"), rejectVoidRequest);

export default router;
