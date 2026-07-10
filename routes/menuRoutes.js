// routes/menuRoutes.js
import express from "express";
import { getMenu, createMenuItem } from "../controllers/menuController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getMenu);
router.post("/", protect, authorize("admin", "manager", "waiter", "accountant"), createMenuItem);

export default router;
