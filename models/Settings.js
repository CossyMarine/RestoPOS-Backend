const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    minWithdrawal: { type: Number, default: 5 }, // Default $5
    withdrawalDays: { type: Number, default: 7 }, // Withdraw every 7 days
    dailyCheckInEnabled: { type: Boolean, default: true },
    platformFeePct: { type: Number, default: 30 }, // % fee on poster deposit
    autoApproveDays: { type: Number, default: 3 },  // poster has N days to act
    minPayGlobal: { type: Number, default: 0.05 },  // fallback min per task

  // Optional per-category minimums and suggested ranges
  categoryMinimums: {
    type: Map,
    of: Number, // e.g. { survey: 0.08, video: 0.05, app_install: 0.25 }
    default: {}
  },
  categoryRecommendations: {
    type: Map,
    of: new mongoose.Schema({
      low: Number, mid: Number, high: Number
    }, { _id: false }),
    default: {}
  }


  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);