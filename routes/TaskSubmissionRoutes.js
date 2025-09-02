// Routes/TaskSubmissionRoutes.js
const express = require("express");
const router = express.Router();
const {
  createSubmission,
  approveSubmission,
  rejectSubmission,
} = require("../Controllers/TaskSubmissionController");
const { protect } = require("../Middlewares/authMiddleware");
const roleMiddleware = require("../Middlewares/roleMiddleware");

// User creates a submission
router.post("/", protect, createSubmission);

// Admin approves submission
router.put("/:id/approve", protect, roleMiddleware(["admin"]), approveSubmission);

// Admin rejects submission
router.put("/:id/reject", protect, roleMiddleware(["admin"]), rejectSubmission);

module.exports = router;