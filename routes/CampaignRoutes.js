import { Router } from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import role from "../Middlewares/roleMiddleware.js";
import * as C from "../Controllers/CampaignController.js";

const router = Router();

router.get("/", C.listActive);
router.post("/", protect, C.createCampaign);
router.put("/:id/fund-activate", protect, C.fundAndActivate);
router.put("/:id/pause", protect, C.pauseCampaign);
router.put("/:id/resume", protect, C.resumeCampaign);
router.put("/:id/stop", protect, C.stopCampaign);
router.post("/:id/submit", protect, C.submitProof);
router.put("/:id/submissions/:submissionId/review", protect, C.reviewSubmissionByPoster);

export default router;
