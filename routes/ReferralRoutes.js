const express = require("express");
const router = express.Router();
const { protect } = require("../Middlewares/authMiddleware");
const {
  updateRefereeTasks,
  getReferralStats
} = require("../Controllers/ReferralController");

// Update tasks completed by referee
router.put("/update-tasks", protect, updateRefereeTasks);

// Get referral stats for user
router.get("/me", protect, getReferralStats);

module.exports = router;