// models/Campaign.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    proofText: String,
    proofUrl: String,
    extraFields: { type: Object, default: {} }, // ids, handles, etc.

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "auto_approved",
        "disputed",
        "upheld",
        "overturned",
      ],
      default: "pending",
    },

    rejectionReason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // poster or admin
    reviewedAt: Date,
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "survey",
        "video",
        "follow",
        "signup",
        "offer",
        "app_install",
        "other",
      ],
      required: true,
    },

    // pricing (cut only at deposit)
    payPerTask: { type: Number, required: true }, // what earner gets
    platformFeePctAtCreate: { type: Number, required: true }, // snapshot of % fee at creation (e.g. 30)

    // caps
    maxEarners: { type: Number, required: true }, // number of completions to buy
    perUserLimit: { type: Number, default: 1 }, // anti-abuse limit/user

    // links/rules
    instructions: String,
    targetUrl: String,

    // ownership
    poster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // financials (escrow system)
    escrowRequired: { type: Number, required: true }, // deposit = (maxEarners * payPerTask) + fee
    escrowLocked: { type: Number, default: 0 }, // actual amount held in escrow
    feeAmount: { type: Number, required: true }, // platform fee portion
    payoutBudget: { type: Number, required: true }, // only for earners
    refundedAmount: { type: Number, default: 0 }, // unused refund to poster if stopped

    // runtime state
    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "paused",
        "completed",
        "exhausted",
        "stopped",
      ],
      default: "draft",
      index: true,
    },
    completedCount: { type: Number, default: 0 },
    pendingCount: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },
    rejectedCount: { type: Number, default: 0 },

    submissions: [submissionSchema],

    approvalsCloseAt: Date, // auto-approve window
    expiresAt: Date,
  },
  { timestamps: true }
);

// 📌 Indexes for performance
campaignSchema.index({ status: 1, category: 1, createdAt: -1 });

// 🔄 Auto-close campaign on budget exhaustion
campaignSchema.pre("save", function (next) {
  if (this.payoutBudget <= 0 && this.status === "active") {
    this.status = "exhausted";
  }
  next();
});

module.exports = mongoose.model("Campaign", campaignSchema);