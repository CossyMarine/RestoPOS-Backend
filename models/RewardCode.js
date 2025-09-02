const mongoose = require("mongoose");

const rewardCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  rewardType: {
    type: String,
    enum: ["fixed", "random"],
    required: true,
  },
  fixedReward: {
    type: Number, // used if rewardType === 'fixed'
  },
  minReward: {
    type: Number, // used if rewardType === 'random'
  },
  maxReward: {
    type: Number, // used if rewardType === 'random'
  },
  maxUsers: {
    type: Number,
    required: true,
  },
  redeemedCount: {
    type: Number,
    default: 0,
  },
  redeemedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      amount: Number,
      redeemedAt: { type: Date, default: Date.now },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("RewardCode", rewardCodeSchema);