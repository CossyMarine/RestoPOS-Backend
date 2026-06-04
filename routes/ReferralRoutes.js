import { Router } from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import { updateRefereeTasks, getReferralStats } from "../Controllers/ReferralController.js";

const router = Router();

router.put("/update-tasks", protect, updateRefereeTasks);
router.get("/me", protect, getReferralStats);

export default router;
