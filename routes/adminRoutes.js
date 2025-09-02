const express = require("express");
const router = express.Router();
const { protect } = require("../Middlewares/authMiddleware");
const roleMiddleware = require("../Middlewares/roleMiddleware");
const {
  blockUser,
  changeRole,
  getAnalytics,
  updateWithdrawalSettings,
  toggleDailyCheckIn,
} = require("../Controllers/AdminController");

// 🔹 Test route
router.get("/admin-only", protect, roleMiddleware("admin"), (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

// 🔹 User management
router.put("/block-user", protect, roleMiddleware("admin"), blockUser);
router.put("/change-role", protect, roleMiddleware("admin"), changeRole);

// 🔹 Analytics
router.get("/analytics", protect, roleMiddleware("admin"), getAnalytics);

// 🔹 System settings
router.put(
  "/withdrawal-settings",
  protect,
  roleMiddleware("admin"),
  updateWithdrawalSettings
);
router.put(
  "/toggle-daily-checkin",
  protect,
  roleMiddleware("admin"),
  toggleDailyCheckIn
);

module.exports = router;