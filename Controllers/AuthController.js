const User = require("../models/User");
const Token = require("../models/Token");
const Wallet = require("../models/Wallet"); // ✅ import Wallet model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../Utils/sendEmail"); // fixed import

const generateToken = (id) => {
return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 📍 REGISTER
exports.register = async (req, res) => {
try {
const {
fullName,
email,
country,
phone,
password,
confirmPassword,
agreedToTerms,
referrerId,
} = req.body;

if (password !== confirmPassword) {  
  return res.status(400).json({ message: "Passwords do not match" });  
}  

const existingUser = await User.findOne({ email });  
if (existingUser)  
  return res.status(400).json({ message: "Email already registered" });  

const hashedPassword = await bcrypt.hash(password, 10);  

const newUser = await User.create({  
  fullName,  
  email,  
  country,  
  phone,  
  password: hashedPassword,  
  agreedToTerms,  
  isVerified: false,  
});  

// ✅ Auto create wallet for new user  
await Wallet.create({  
  user: newUser._id, // ⚠ ensure field is consistent  
  balance: 0,  
  currency: "USD",  
});  

// create verification token  
const token = crypto.randomBytes(32).toString("hex");  
await Token.create({  
  userId: newUser._id,  
  token,  
  type: "verify",  
  expiresAt: new Date(Date.now() + 3600000), // 1 hour  
});  

const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}&id=${newUser._id}`;  

// ✅ send verification email  
await sendEmail({  
  email: newUser.email,  
  subject: "Verify your Marine Cash account",  
  message: `Hi ${newUser.fullName}, please verify your email: ${verifyUrl}`,  
  html: `<p>Hi ${newUser.fullName},</p>    
         <p>Please verify your email by clicking below:</p>    
         <a href="${verifyUrl}">Verify Email</a>`,  
});  

// Handle referral if referrerId provided  
if (referrerId) {  
  const { addReferral } = require("./ReferralController");  
  await addReferral({ referrerId, refereeId: newUser._id });  
}  

res.status(201).json({  
  message: "Verification email has been sent! Please check your inbox.",  
  emailSentTo: newUser.email,  
});

} catch (error) {
res.status(500).json({ message: error.message });
}
};

// 📍 VERIFY EMAIL (Corrected)
exports.verifyEmail = async (req, res) => {
try {
const { token, id } = req.query;

if (!token || !id) {  
  return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&msg=Invalid user`);  
}  

// ✅ Check token AND expiration  
const tokenDoc = await Token.findOne({  
  userId: id,  
  token,  
  type: "verify",  
  expiresAt: { $gt: new Date() }, // only valid if not expired  
});  

if (!tokenDoc) {  
  return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error`);  
}  

const user = await User.findById(tokenDoc.userId);  
if (!user) {  
  return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&msg=User not found`);  
}  

user.isVerified = true;  
await user.save();  
await Token.deleteOne({ _id: tokenDoc._id });  

//0.50USD BONUS
const Transaction = require("../models/WalletTransaction");

// 🎁 Credit $0.50 welcome bonus after first verification
const wallet = await Wallet.findOne({ user: user._id });
if (wallet) {
  const existingBonus = await Transaction.findOne({ user: user._id, type: "bonus" });

  if (!existingBonus) {
    wallet.balance += 0.5;
    await wallet.save();

    await Transaction.create({
      user: user._id,
      type: "bonus",
      amount: 0.5,
      netAmount: 0.5,
      fee: 0,
      status: "completed",
    });
  }
}else{
  console.log("No wallet found for user:", user._id);
}
//mark bonus given
user.signupBonusGiven=true;
await user.save();
// ✅ Send welcome email  
await sendEmail({  
  email: user.email,  
  subject: "🎉 Welcome to MarineCash!",  
  html: `  
    <h2>Hi ${user.fullName || "MarineCash User"},</h2>  
    <p>Congratulations! 🎉 Your email has been successfully verified.</p>  
    <p>Welcome to <b>MarineCash</b> – your trusted earning platform. Here’s what you can do:</p>  
    <ul>  
      <li>✅ Do surveys</li>  
      <li>🎥 Watch and earn</li>  
      <li>🎮 Play games</li>  
      <li>📱 Follow, comment, and subscribe</li>  
      <li>💸 Daily check-in rewards</li>  
    </ul>  
    <p>Start exploring today and grow your earnings 🚀</p>  
    <p>Cheers,<br/>MarineCash Team</p>  
  `,  
});  

// ✅ Redirect to frontend verify-email page with success  
res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success`);

} catch (error) {
console.error("VerifyEmail error:", error);
res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error`);
}
};

// 📍 RESEND VERIFICATION EMAIL
exports.resendVerification = async (req, res) => {
try {
const { email } = req.body;

const user = await User.findOne({ email });  
if (!user) return res.status(404).json({ message: "User not found" });  
if (user.isVerified) return res.status(400).json({ message: "User already verified" });  

// Remove old token & create new  
await Token.deleteMany({ userId: user._id, type: "verify" });  
const token = crypto.randomBytes(32).toString("hex");  
await Token.create({  
  userId: user._id,  
  token,  
  type: "verify",  
  expiresAt: new Date(Date.now() + 3600000),  
});  

const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}&id=${user._id}`;  
await sendEmail({  
  email: user.email,  
  subject: "Resend Verification - MarineCash",  
  html: `<p>Hi ${user.fullName},</p>  
         <p>Please verify your email again by clicking below:</p>  
         <a href="${verifyUrl}">Verify Email</a>`,  
});  

res.json({ message: "Verification email resent successfully" });

} catch (error) {
res.status(500).json({ message: error.message });
}
};

// 📍 LOGIN
exports.login = async (req, res) => {
try {
const { email, password } = req.body;

const user = await User.findOne({ email });  
if (!user)  
  return res.status(400).json({ message: "Invalid email or password" });  

const isMatch = await bcrypt.compare(password, user.password);  
if (!isMatch)  
  return res.status(400).json({ message: "Invalid email or password" });  

if (!user.isVerified)  
  return res.status(400).json({ message: "Please verify your email first" });  

// ✅ Fetch wallet  
const wallet = await Wallet.findOne({ user: user._id });  

res.json({  
  token: generateToken(user._id),  
  user: {  
    id: user._id,  
    uniqueId: user.uniqueId,  
    fullName: user.fullName,  
    email: user.email,  
    country: user.country,  
    phone: user.phone,  
  },  
  wallet: {  
    balance: wallet?.balance || 0,  
    currency: wallet?.currency || "USD",  
  },  
});

} catch (error) {
res.status(500).json({ message: error.message });
}
};

// 📍 FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
try {
const user = await User.findOne({ email: req.body.email });
if (!user) return res.status(400).json({ message: "User not found" });

const token = crypto.randomBytes(32).toString("hex");  
await Token.create({  
  userId: user._id,  
  token,  
  type: "reset",  
  expiresAt: new Date(Date.now() + 3600000),  
});  

const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;  

await sendEmail({  
  email: user.email,  
  subject: "Reset your Marine Cash password",  
  html: `<p>Click below to reset your password:</p>    
         <a href="${resetUrl}">Reset Password</a>`,  
});  

res.json({ message: "Password reset email sent" });

} catch (error) {
res.status(500).json({ message: error.message });
}
};

// 📍 RESET PASSWORD
exports.resetPassword = async (req, res) => {
try {
const tokenDoc = await Token.findOne({
token: req.params.token,
type: "reset",
});
if (!tokenDoc)
return res.status(400).json({ message: "Invalid or expired token" });

const user = await User.findById(tokenDoc.userId);  
if (!user) return res.status(400).json({ message: "User not found" });  

const hashedPassword = await bcrypt.hash(req.body.password, 10);  
user.password = hashedPassword;  
await user.save();  
await Token.deleteOne({ _id: tokenDoc._id });  

res.json({ message: "Password reset successfully!" });

} catch (error) {
res.status(500).json({ message: error.message });
}
};

// 📍 GET PROFILE
exports.getProfile = async (req, res) => {
try {
const user = await User.findById(req.user.id).select("-password");
if (!user) return res.status(404).json({ message: "User not found" });

// ✅ Fetch wallet  
const wallet = await Wallet.findOne({ user: user._id });  

res.json({  
  ...user.toObject(),  
  wallet: {  
    balance: wallet?.balance || 0,  
    currency: wallet?.currency || "USD",  
  },  
});

} catch (error) {
res.status(500).json({ message: error.message });
}
};