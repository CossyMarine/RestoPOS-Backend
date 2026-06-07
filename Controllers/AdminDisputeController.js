// Controllers/AdminDisputeController.js
import TaskSubmission from "../models/TaskSubmission.js";
import Campaign from "../models/Campaign.js";

export const reviewDispute = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { decision, comment } = req.body;

    if (!["approved", "rejected"].includes(decision))
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });

    const submission = await TaskSubmission.findById(submissionId);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    submission.status = decision;
    submission.reviewedBy = req.user._id;
    submission.reviewComment = comment || "";
    await submission.save();

    res.json({ message: `Dispute resolved: submission ${decision}`, submission });
  } catch (e) {
    console.error("reviewDispute error:", e);
    res.status(500).json({ message: e.message });
  }
};
