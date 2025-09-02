const RewardCode = require("../models/RewardCode");
const Wallet = require ("../models/Wallet");

// Helper function to generate random code
const generateRandomCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ===================== CREATE REWARD CODE =====================
exports.createRewardCode = async (req, res) => {
  try {
    const {
      rewardType,
      fixedReward,
      minReward,
      maxReward,
      maxUsers,
      expiresAt,
      customCode, // optional: admin can provide own code
    } = req.body;

    // Generate code if admin didn't provide one
    const code = customCode || generateRandomCode(8);

    // Check for uniqueness
    const existing = await RewardCode.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Code already exists. Try again." });
    }

    // Create new RewardCode
    const newCode = await RewardCode.create({
      code,
      rewardType,
      fixedReward: rewardType === "fixed" ? fixedReward : undefined,
      minReward: rewardType === "random" ? minReward : undefined,
      maxReward: rewardType === "random" ? maxReward : undefined,
      maxUsers,
      expiresAt,
    });

    res.status(201).json({
      message: "Reward code created successfully",
      code: newCode,
    });
  } catch (error) {
    console.error("Error creating reward code:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== DEACTIVATE REWARD CODE =====================
exports.deactivateRewardCode = async (req, res) => {
  try {
    const { codeId } = req.params; // code ID from URL

    // Find the code
    const rewardCode = await RewardCode.findById(codeId);
    if (!rewardCode) {
      return res.status(404).json({ message: "Reward code not found" });
    }

    // Deactivate
    rewardCode.isActive = false;
    await rewardCode.save();

    res.status(200).json({
      message: 'Reward code ${rewardCode.code} has been deactivated',
      code: rewardCode,
    });
  } catch (error) {
    console.error("Error deactivating reward code:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== LIST / FILTER REWARD CODES =====================
exports.listRewardCodes = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { rewardType, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Filter by type (fixed/random)
    if (rewardType) {
      filter.rewardType = rewardType.toLowerCase();
    }

    // Filter by status (active, expired, deactivated)
    if (status) {
      if (status === "active") filter.isActive = true;
      if (status === "deactivated") filter.isActive = false;
      if (status === "expired") filter.expiresAt = { $lte: new Date() };
    }

    // Search by code string
    if (search) {
      filter.code = { $regex: search, $options: "i" };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch reward codes
    const rewardCodes = await RewardCode.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Count total for pagination
    const total = await RewardCode.countDocuments(filter);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      rewardCodes,
    });
  } catch (error) {
    console.error("Error listing reward codes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== REDEEM REWARD CODE =====================
exports.redeemRewardCode = async (req, res) => {
  try {
    const { code } = req.body; // user enters code
    const userId = req.user._id; // user must be logged in

    // Find code
    const rewardCode = await RewardCode.findOne({ code });
    if (!rewardCode) {
      return res.status(404).json({ message: "Invalid reward code" });
    }

    // Check if code is active
    if (!rewardCode.isActive) {
      return res
        .status(400)
        .json({ message: "❌ This reward code has already been fully redeemed." });
    }

    // Check if code expired
    if (rewardCode.expiresAt && new Date() > rewardCode.expiresAt) {
      return res.status(400).json({ message: "❌ This reward code has expired." });
    }

    // Check max users
    if (rewardCode.redeemedCount >= rewardCode.maxUsers) {
      rewardCode.isActive = false; // deactivate if max reached
      await rewardCode.save();
      return res
        .status(400)
        .json({ message: "❌ This reward code has already been fully redeemed." });
    }

    // Check if user already redeemed
    const alreadyRedeemed = rewardCode.redeemedBy.find(
      (r) => r.userId.toString() === userId.toString()
    );
    if (alreadyRedeemed) {
      return res
        .status(400)
        .json({ message: "You have already redeemed this code." });
    }

    // Calculate reward
    let amount;
    if (rewardCode.rewardType === "fixed") {
      amount = rewardCode.fixedReward;
    } else {
      // random between minReward and maxReward
      amount =
        Math.random() * (rewardCode.maxReward - rewardCode.minReward) +
        rewardCode.minReward;
      amount = Number(amount.toFixed(3)); // round to 3 decimals
    }

    // Deactivate if max users reached
    if (rewardCode.redeemedCount >= rewardCode.maxUsers) {
      rewardCode.isActive = false;
    }

    await rewardCode.save();

    
// ===== Add reward to user wallet =====
    let updatedBalance;
    let userWallet = await Wallet.findOne({ user: userId });
    if (userWallet) {
      userWallet.balance += amount;
      userWallet.updatedAt = new Date();
      await userWallet.save();
      updatedBalance = userWallet.balance;
    } else {
      const newWallet = await Wallet.create({ user: userId, balance: amount, user: userId });
      updatedBalance = newWallet.balance;
    }

    // Record redemption and update rewardCode
    rewardCode.redeemedBy.push({ userId, amount });
    rewardCode.redeemedCount += 1;
    if (rewardCode.redeemedCount >= rewardCode.maxUsers) {
      rewardCode.isActive = false;
    }
    await rewardCode.save();

    // Send response with amount and newBalance
    res.status(200).json({
      message: "Reward redeemed successfully",
      amount,
      newBalance: updatedBalance,
    });

  } catch (error) {
    console.error("Error redeeming reward code:", error);
    res.status(500).json({ message: "Server error" });
  }
};