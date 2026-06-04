import mongoose from "mongoose";

const TaskSubmissionSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submissionProof: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewComment: { type: String },
    rewardAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("TaskSubmission", TaskSubmissionSchema);
