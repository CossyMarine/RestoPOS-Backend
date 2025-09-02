const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "task_reward", "offerwall_reward", "bonus"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  netAmount: {
    type: Number,
    required: true, // what user actually receives/sees
  },
  fee: {
    type: Number,
    default: 0, // system fee (not visible to user)
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save logic to auto-apply rules
transactionSchema.pre("save", function (next) {
  if (this.type === "deposit") {
    this.fee = this.amount * 0.3; // 30% fee
    this.netAmount = this.amount - this.fee;
  } else if (this.type === "offerwall_reward") {
    this.fee = this.amount * 0.2; // 20% fee
    this.netAmount = this.amount - this.fee;
  } else if (this.type === "task_reward") {
    this.fee = 0; // No cut for user-posted tasks
    this.netAmount = this.amount;
  } else if (this.type === "bonus") {
    this.fee = 0;
    this.netAmount = this.amount;
  } else if (this.type === "withdrawal") {
    this.fee = this.amount * 0.1; // 10% withdrawal fee
    this.netAmount = this.amount - this.fee;
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);