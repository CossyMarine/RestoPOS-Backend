import mongoose from "mongoose";

const TAGS = ["general", "important", "hot", "new", "warning"];

const announcementSchema = new mongoose.Schema(
  {
    title:    { type: String, default: "" },
    text:     { type: String, required: true, trim: true },
    tag:      { type: String, enum: TAGS, default: "general" },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    readBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
