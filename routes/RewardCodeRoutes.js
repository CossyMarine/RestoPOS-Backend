import { Router } from "express";
import { createRewardCode, deactivateRewardCode, listRewardCodes, redeemRewardCode } from "../Controllers/RewardCodeController.js";
import { protect } from "../Middlewares/authMiddleware.js";
import restrictTo from "../Middlewares/roleMiddleware.js";

const router = Router();

router.post("/create", protect, restrictTo("admin"), createRewardCode);
router.patch("/deactivate/:codeId", protect, restrictTo("admin"), deactivateRewardCode);
router.get("/list", protect, restrictTo("admin"), listRewardCodes);
router.post("/redeem", protect, redeemRewardCode);

export default router;
