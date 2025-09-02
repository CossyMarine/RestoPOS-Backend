// routes/TaskRoutes.js
const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
} = require("../Controllers/taskcontroller");
const { protect } = require("../Middlewares/authMiddleware");
const roleMiddleware = require("../Middlewares/roleMiddleware");

// Public Routes
router.get("/", getTasks);
router.get("/:id", getTaskById);

// Admin Route to create task
router.post("/", protect, roleMiddleware("admin"), createTask);

module.exports = router;