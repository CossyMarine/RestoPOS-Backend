import { Router } from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import restrictTo from "../Middlewares/roleMiddleware.js";
import {
  getProfile, updateProfile, uploadAvatar,
  getAllUsers, updateUserRole, avatarUpload,
} from "../Controllers/UserController.js";

const router = Router();

router.get("/profile",      protect, getProfile);
router.put("/profile",      protect, updateProfile);
router.post("/avatar",      protect, avatarUpload.single("avatar"), uploadAvatar);
router.get("/",             protect, restrictTo("admin"), getAllUsers);
router.put("/update-role",  protect, restrictTo("admin"), updateUserRole);

export default router;
