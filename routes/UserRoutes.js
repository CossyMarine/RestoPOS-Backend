const express = require("express");
const router = express.Router();

// Middlewares
const { protect } = require("../Middlewares/authMiddleware"); // named export
const restrictTo = require("../Middlewares/roleMiddleware"); // default export

// Controllers
const {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole
} = require("../controllers/UserController");

// Routes
router.get("/profile", protect, getProfile); // any logged-in user
router.put("/profile", protect, updateProfile);
router.get("/", protect, restrictTo("admin"), getAllUsers); // admin only
router.put("/update-role", protect, restrictTo("admin"), updateUserRole); // admin only

module.exports = router;