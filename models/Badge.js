import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String },
    hidden:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Badge", badgeSchema);
