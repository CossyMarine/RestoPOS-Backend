// routes/shiftRoutes.js
import express from "express";
import {
  openShift,
  getCurrentShift,
  addPettyCash,
  getShiftSummary,
  closeShift,
} from "../controllers/shiftController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/open", protect, openShift);
router.get("/current", protect, getCurrentShift);
router.post("/:id/petty-cash", protect, addPettyCash);
router.get("/:id/summary", protect, getShiftSummary);
router.post("/:id/close", protect, closeShift);

export default router;
