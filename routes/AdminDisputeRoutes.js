const router = require("express").Router();
const { protect } = require("../Middlewares/authMiddleware");
const role = require("../Middlewares/roleMiddleware");
const D = require("../Controllers/AdminDisputeController");

router.post(
  "/campaigns/:id/submissions/:submissionId/dispute",
  protect,
  role("admin"),
  D.reviewDispute
);

module.exports = router;