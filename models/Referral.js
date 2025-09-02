const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  referee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasksCompletedByReferee: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "active"], default: "pending" },
  earnedAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Referral", referralSchema);