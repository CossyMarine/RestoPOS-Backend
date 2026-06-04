import { Router } from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import restrictTo from "../Middlewares/roleMiddleware.js";
import { getProfile, updateProfile, getAllUsers, updateUserRole } from "../Controllers/UserController.js";

const router = Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/", protect, restrictTo("admin"), getAllUsers);
router.put("/update-role", protect, restrictTo("admin"), updateUserRole);

export default router;
