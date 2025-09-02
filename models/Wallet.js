// models/Wallet.js
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    default: 0.5, // $0.50 signup bonus
  },
  totalEarned: {
    type: Number,
    default: 0,
  },
  earnedToday: {
    type: Number,
    default: 0,
  },
  totalDeposited: {
    type: Number,
    default: 0, // needed for frontend display
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  withdrawalHistory: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      status: { type: String, default: "Pending" }, // Pending, Paid, Rejected
    },
  ],
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
    },
  ],
  lastWithdrawalDate: {
    type: Date,
  },
});

module.exports = mongoose.model("Wallet", walletSchema);