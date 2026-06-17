import { Router } from "express";
import * as AuthController from "../Controllers/AuthController.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", protect, AuthController.getProfile);

export default router;
