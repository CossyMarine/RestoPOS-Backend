const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      default: () => uuidv4(),
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    country: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    agreedToTerms: {
      type: Boolean,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user"
    },
    signupBonusGiven: {
      type: Boolean,
      default: false,
    },
    // ✅ Referral & badge info
    referrals: {
      type: Number,
      default: 0
    },
    referralLevel: {
      type: Number,
      default: 1
    },
    badge: {
      type: String,
      default: "/Assets/white.jpg"
    },
    onlineStatus: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);