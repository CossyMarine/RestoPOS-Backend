import { Router } from "express";
import { createTask, getTasks, getTaskById } from "../Controllers/taskcontroller.js";
import { protect } from "../Middlewares/authMiddleware.js";
import roleMiddleware from "../Middlewares/roleMiddleware.js";

const router = Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", protect, roleMiddleware("admin"), createTask);

export default router;
