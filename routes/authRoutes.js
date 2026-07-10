// routes/authRoutes.js
import express from "express";
import { login, createUser, getWaiters } from "../controllers/authController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", protect, authorize("admin", "manager"), createUser);
router.get("/waiters", protect, getWaiters);

export default router;
