// controllers/WalletController.js
const Wallet = require("../models/Wallet");
const Transaction = require("../models/WalletTransaction");

// Helper: check if today is Friday
const isFriday = () => new Date().getDay() === 5; // 0=Sunday, 5=Friday

// ✅ Get wallet info for logged-in user
exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).populate("transactions");
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.json({
      balance: wallet.balance || 0,
      earnedToday: wallet.earnedToday || 0,
      totalDeposited: wallet.totalDeposited || 0,
      totalWithdrawn: wallet.totalWithdrawn || 0,
      withdrawalHistory: wallet.withdrawalHistory || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Deposit money
exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const fee = amount * 0.3;
    const finalAmount = amount - fee;

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.balance += finalAmount;
    wallet.totalDeposited += amount;

    const transaction = new Transaction({
      user: req.user._id,
      type: "deposit",
      amount,
      fee,
      finalAmount,
      status: "success",
    });

    wallet.transactions.push(transaction._id);

    await transaction.save();
    await wallet.save();

    res.json({
      message: "Deposit successful",
      wallet: {
        balance: wallet.balance,
        earnedToday: wallet.earnedToday,
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
        withdrawalHistory: wallet.withdrawalHistory,
      },
      transaction,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Withdraw money
exports.withdraw = async (req, res) => {
  try {
    const { amount } = req.body;

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    if (amount < 5) return res.status(400).json({ message: "Minimum withdrawal is $5" });
    if (wallet.balance < amount) return res.status(400).json({ message: "Insufficient balance" });
    if (!isFriday()) return res.status(400).json({ message: "Withdrawals allowed only on Friday" });

    const fee = amount * 0.1;
    const finalAmount = amount - fee;

    // Update wallet
    wallet.balance -= amount;
    wallet.totalWithdrawn += finalAmount;
    wallet.withdrawalHistory.push({
      amount,
      date: new Date(),
      status: "Pending",
    });

    const transaction = new Transaction({
      user: req.user._id,
      type: "withdrawal",
      amount,
      fee,
      finalAmount,
      status: "Pending",
    });

    wallet.transactions.push(transaction._id);

    await transaction.save();
    await wallet.save();

    res.json({
      message: "Withdrawal request submitted",
      wallet: {
        balance: wallet.balance,
        earnedToday: wallet.earnedToday,
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
        withdrawalHistory: wallet.withdrawalHistory,
      },
      transaction,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get withdrawal history
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.json(wallet.withdrawalHistory.sort((a, b) => b.date - a.date));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Approve/Reject withdrawal (Admin)
exports.approveWithdrawal = async (req, res) => {
  try {
    const { transactionId, status } = req.body; // "success" or "rejected"

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (transaction.type !== "withdrawal") return res.status(400).json({ message: "Not a withdrawal transaction" });
    if (transaction.status !== "Pending") return res.status(400).json({ message: "Transaction already processed" });

    transaction.status = status;
    await transaction.save();

    res.json({ message: `Withdrawal ${status}`, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).populate("transactions");
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    res.json(wallet.transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin: Edit wallet balance
exports.editWalletBalance = async (req, res) => {
  try {
    const { userId, newBalance } = req.body;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.balance = newBalance;
    await wallet.save();

    res.json({
      message: "Wallet balance updated",
      wallet: {
        balance: wallet.balance,
        earnedToday: wallet.earnedToday,
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
        withdrawalHistory: wallet.withdrawalHistory,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Credit Signup Bonus
exports.creditBonus = async (userId, amount, description = "Signup Bonus") => {
  try {
    let wallet = await Wallet.findOne({ user: userId });

    // If wallet doesn’t exist, create one
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        earnedToday: 0,
        withdrawalHistory: [],
      });
    }

    wallet.balance += amount;
    await wallet.save();

    const transaction = new Transaction({
      user: userId,
      type: "bonus",
      amount,
      fee: 0,
      finalAmount: amount,
      status: "success",
      description,
    });

    wallet.transactions.push(transaction._id);

    await transaction.save();
    await wallet.save();

    return { success: true, balance: wallet.balance };
  } catch (err) {
    console.error("Error crediting bonus:", err);
    return { success: false, error: err.message };
  }
};