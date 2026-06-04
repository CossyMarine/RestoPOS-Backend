import { Router } from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import roleMiddleware from "../Middlewares/roleMiddleware.js";
import { reviewTask, approveTask, rejectTask, viewReports, viewUsers } from "../Controllers/ModeratorController.js";

const router = Router();

router.get("/review-tasks", protect, roleMiddleware("moderator"), reviewTask);
router.put("/approve-task/:taskId", protect, roleMiddleware("moderator"), approveTask);
router.put("/reject-task/:taskId", protect, roleMiddleware("moderator"), rejectTask);
router.get("/view-users", protect, roleMiddleware("moderator"), viewUsers);
router.get("/reports", protect, roleMiddleware("moderator"), viewReports);

export default router;
