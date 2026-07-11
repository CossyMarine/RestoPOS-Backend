// routes/authRoutes.js
import express from "express";
import { login, createUser, getWaiters, registerCustomer } from "../controllers/authController.js";
import { protect, authorize } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register-customer", registerCustomer); // public — customer self-signup
router.post("/register", protect, authorize("admin", "manager"), createUser); // staff only
router.get("/waiters", protect, getWaiters);

export default router;
