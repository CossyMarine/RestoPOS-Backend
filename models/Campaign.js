import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    proofText: String,
    proofUrl: String,
    proofImageUrls: [{ type: String }],
    extraFields: { type: Object, default: {} },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "auto_approved"],
      default: "pending",
    },
    rejectionReason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["survey", "video", "follow", "signup", "offer", "app_install", "game", "other"],
      required: true,
    },
    payPerTask: { type: Number, required: true },
    platformFeePctAtCreate: { type: Number, required: true },
    maxEarners: { type: Number, required: true },
    perUserLimit: { type: Number, default: 1 },
    instructions: { type: String },
    targetUrl: { type: String },
    exampleImageUrls: [{ type: String }],
    poster: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Financials
    escrowRequired: { type: Number, required: true },
    escrowLocked: { type: Number, default: 0 },
    feeAmount: { type: Number, required: true },
    payoutBudget: { type: Number, required: true },
    refundedAmount: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["pending_approval", "draft", "active", "paused", "completed", "exhausted", "stopped", "rejected"],
      default: "pending_approval",
      index: true,
    },

    // Admin review
    adminReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminReviewedAt: { type: Date },
    adminRejectionReason: { type: String },

    // Counters
    completedCount: { type: Number, default: 0 },
    pendingCount: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },
    rejectedCount: { type: Number, default: 0 },

    submissions: [submissionSchema],
    approvalsCloseAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, category: 1, createdAt: -1 });

campaignSchema.pre("save", function (next) {
  if (this.payoutBudget <= 0 && this.status === "active") {
    this.status = "exhausted";
  }
  next();
});

export default mongoose.model("Campaign", campaignSchema);
