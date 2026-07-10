// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true }, // bcrypt hash
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "cashier", "waiter", "kitchen", "accountant"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
