const router = require("express").Router();
const { protect } = require("../Middlewares/authMiddleware");
const role = require("../Middlewares/roleMiddleware");
const C = require("../Controllers/CampaignController");

// Public browse
router.get("/", C.listActive);

// Poster flow
router.post("/", protect, C.createCampaign);                             // create draft
router.put("/:id/fund-activate", protect, C.fundAndActivate);            // lock escrow & go live
router.put("/:id/pause", protect, C.pauseCampaign);
router.put("/:id/resume", protect, C.resumeCampaign);
router.put("/:id/stop", protect, C.stopCampaign);

// Earner submits
router.post("/:id/submit", protect, C.submitProof);

// Poster reviews
router.put("/:id/submissions/:submissionId/review", protect, C.reviewSubmissionByPoster);

module.exports = router;