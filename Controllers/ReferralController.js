
const Referral = require("../models/Referral");
const Wallet = require("../models/Wallet");

// 1️⃣ Add referral
exports.addReferral = async ({ referrerId, refereeId }) => {
try {
// Prevent self-referral
if (referrerId === refereeId) return;

const existing = await Referral.findOne({ referrer: referrerId, referee: refereeId });  
if (existing) return;  

await Referral.create({ referrer: referrerId, referee: refereeId });

} catch (error) {
console.error("Error adding referral:", error);
}
};

// 2️⃣ Update referee tasks
exports.updateRefereeTasks = async (req, res) => {
try {
const { refereeId, tasksCompleted } = req.body;

const referral = await Referral.findOne({ referee: refereeId });  
if (!referral) return res.status(404).json({ message: "Referral not found" });  

referral.tasksCompletedByReferee = tasksCompleted;  
if (tasksCompleted >= 2) referral.status = "active";  

await referral.save();  
res.status(200).json({ message: "Referral updated", referral });

} catch (error) {
console.error(error);
res.status(500).json({ message: "Server error" });
}
};

// 3️⃣ Add referral earnings (called from task completion)
exports.addReferralEarnings = async (refereeId, taskEarning) => {
try {
const referral = await Referral.findOne({ referee: refereeId, status: "active" });
if (!referral) return;

const commission = taskEarning * 0.1; // 10% fee  
const systemCut = commission * 0.15; // 15% cut  
const netEarning = commission - systemCut;  

referral.earnedAmount += netEarning;  
await referral.save();  

// Add to referrer wallet  
let wallet = await Wallet.findOne({ user: referral.referrer });  
if (wallet) {  
  wallet.balance += netEarning;  
  await wallet.save();  
} else {  
  await Wallet.create({ user: referral.referrer, balance: netEarning });  
}

} catch (error) {
console.error("Error adding referral earnings:", error);
}
};

// 4️⃣ Get referral stats
exports.getReferralStats = async (req, res) => {
try {
const userId = req.user._id;
const referrals = await Referral.find({ referrer: userId });
const totalEarned = referrals.reduce((acc, r) => acc + r.earnedAmount, 0);
const totalMembers = referrals.length;

// Determine level & badge  
let level = 0, badge = null;  
if (totalMembers >= 200) { level = 5; badge = "/Assets/orange.jpg"; }  
else if (totalMembers >= 100) { level = 4; badge = "/Assets/blue.jpg"; }  
else if (totalMembers >= 50) { level = 3; badge = "/Assets/black.jpg"; }  
else if (totalMembers >= 20) { level = 2; badge = "/Assets/white.jpg"; }  
else if (totalMembers >= 10) { level = 1; badge = null; }  

res.status(200).json({ totalEarned, totalMembers, level, badge, referrals });

} catch (error) {
console.error(error);
res.status(500).json({ message: "Server error" });
}
};