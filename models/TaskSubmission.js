const mongoose = require("mongoose");

const TaskSubmissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // link to the task
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who submitted the task
      required: true,
    },
    submissionProof: {
      type: String, // could be image URL, text, screenshot, link, etc.
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin or Moderator who reviews
    },
    reviewComment: {
      type: String, // optional feedback (why rejected, etc.)
    },
    rewardAmount: {
      type: Number,
      default: 0, // set after approval
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskSubmission", TaskSubmissionSchema);