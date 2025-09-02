const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, required: true }, // e.g. "Blocked User", "Changed Role"
    details: { type: String }, // Extra info: userId, old/new values
    ipAddress: { type: String }, // Capture request IP
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);