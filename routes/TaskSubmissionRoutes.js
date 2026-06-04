import { Router } from "express";
import { createSubmission, approveSubmission, rejectSubmission } from "../Controllers/TaskSubmissionController.js";
import { protect } from "../Middlewares/authMiddleware.js";
import roleMiddleware from "../Middlewares/roleMiddleware.js";

const router = Router();

router.post("/", protect, createSubmission);
router.put("/:id/approve", protect, roleMiddleware("admin"), approveSubmission);
router.put("/:id/reject", protect, roleMiddleware("admin"), rejectSubmission);

export default router;
