// routes/revenueRoutes.js
import express from "express";
import { getTodayRevenue } from "../controllers/revenueController.js";

const router = express.Router();

router.get("/today", getTodayRevenue);

export default router;
