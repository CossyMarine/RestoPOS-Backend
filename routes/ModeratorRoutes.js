const express = require("express");
const router = express.Router();
const { protect } = require("../Middlewares/authMiddleware");
const roleMiddleware = require("../Middlewares/roleMiddleware");

const {
  reviewTask,
  approveTask,
  rejectTask,
  viewReports,
  viewUsers,
} = require("../Controllers/ModeratorController");

// ✅ Moderator-only routes
router.get("/review-tasks", protect, roleMiddleware("moderator"), reviewTask);
router.put("/approve-task/:taskId", protect, roleMiddleware("moderator"), approveTask);
router.put("/reject-task/:taskId", protect, roleMiddleware("moderator"), rejectTask);
router.get("/view-users", protect, roleMiddleware ("moderator"), viewUsers);
// Reports from users
router.get("/reports", protect, roleMiddleware("moderator"), viewReports);

module.exports = router;