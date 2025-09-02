// routes/AuthRoutes.js
const express = require("express");
const router = express.Router();

// Controllers
const AuthController = require("../Controllers/AuthController");

// Middlewares
const { protect } = require("../Middlewares/authMiddleware");

// 🔐 Auth Routes
router.post("/register", AuthController.register);                // User registration
router.get("/verify", AuthController.verifyEmail);          // Email verification (redirects to frontend success/error)
router.post("/login", AuthController.login);                      // User login
router.post("/forgot-password", AuthController.forgotPassword);   // Request reset link
router.post("/reset-password/:token", AuthController.resetPassword); // Reset password

// 👤 Get logged-in user profile (matches frontend getProfile())
router.get("/me", protect, AuthController.getProfile);

// 📨 Optional: Resend verification email (useful if expired)
router.post("/resend-verification", AuthController.resendVerification);

module.exports = router;