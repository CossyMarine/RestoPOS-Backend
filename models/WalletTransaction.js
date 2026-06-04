import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "task_reward", "offerwall_reward", "bonus", "referral_bonus", "escrow_lock", "escrow_release", "payout", "daily_checkin", "signup_bonus", "reward_code"],
      required: true,
    },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    netAmount: { type: Number },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

transactionSchema.pre("save", function (next) {
  if (this.isNew && this.netAmount == null) {
    this.netAmount = this.amount - (this.fee || 0);
  }
  next();
});

export default mongoose.model("WalletTransaction", transactionSchema);
