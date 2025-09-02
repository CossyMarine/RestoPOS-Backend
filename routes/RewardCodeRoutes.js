const express = require("express");
const router = express.Router();

// Controllers
const {
  createRewardCode,
  deactivateRewardCode,
  listRewardCodes,
  redeemRewardCode,
} = require("../Controllers/RewardCodeController");

// Middlewares
const { protect } = require("../Middlewares/authMiddleware"); // ensures user is logged in
const restrictTo = require("../Middlewares/roleMiddleware"); // admin/moderator roles

// ===================== ADMIN ROUTES =====================

// Create a reward code (admin only)
router.post("/create", protect, restrictTo("admin"), createRewardCode);

// Deactivate a reward code (admin only)
router.patch("/deactivate/:codeId", protect, restrictTo("admin"), deactivateRewardCode);

// List / filter reward codes (admin only)
router.get("/list", protect, restrictTo("admin"), listRewardCodes);

// ===================== USER ROUTES =====================

// Redeem a reward code (logged-in users)
router.post("/redeem", protect, redeemRewardCode);

module.exports = router;