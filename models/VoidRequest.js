// models/VoidRequest.js
import mongoose from "mongoose";

const voidRequestSchema = new mongoose.Schema(
  {
    receipt: { type: mongoose.Schema.Types.ObjectId, ref: "Receipt", required: true },
    reason:  { type: String, required: true },

    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("VoidRequest", voidRequestSchema);
