import { Router } from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import restrictTo from "../Middlewares/roleMiddleware.js";
import {
  getPublicFAQs,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../Controllers/FAQController.js";

const router = Router();

// Public (logged-in users)
router.get("/", protect, getPublicFAQs);

// Admin only
router.get("/all", protect, restrictTo("admin", "superadmin"), getAllFAQs);
router.post("/", protect, restrictTo("admin", "superadmin"), createFAQ);
router.put("/:id", protect, restrictTo("admin", "superadmin"), updateFAQ);
router.delete("/:id", protect, restrictTo("admin", "superadmin"), deleteFAQ);

export default router;
