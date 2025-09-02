const User = require("../models/User");
const Settings = require("../models/Settings");

// 🔹 Block/Unblock User
exports.blockUser = async (req, res) => {
  try {
    const { userId, action } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = action === "block";
    await user.save();

    'res.json({ message: User ${action}ed successfully, user })';
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Change Role
exports.changeRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!["user", "moderator"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const moderators = await User.countDocuments({ role: "moderator" });
    const topReferrals = await User.find().sort({ referrals: -1 }).limit(5);

    res.json({ totalUsers, blockedUsers, moderators, topReferrals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Update Withdrawal Settings
exports.updateWithdrawalSettings = async (req, res) => {
  try {
    const { minWithdrawal, withdrawalDays } = req.body;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (minWithdrawal !== undefined) settings.minWithdrawal = minWithdrawal;
    if (withdrawalDays !== undefined) settings.withdrawalDays = withdrawalDays;

    await settings.save();

    res.json({ message: "Withdrawal settings updated", settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Toggle Daily Check-In
exports.toggleDailyCheckIn = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    settings.dailyCheckInEnabled = !settings.dailyCheckInEnabled;
    await settings.save();

    res.json({
      'message: Daily check-in ${settings.dailyCheckInEnabled ? "enabled" : "disabled"}'
      :settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};