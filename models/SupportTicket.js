import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "admin"], required: true },
    text: { type: String, default: "" },
    file: {
      data: { type: String },       // base64
      mimeType: { type: String },
      fileName: { type: String },
    },
    seenByAdmin: { type: Boolean, default: false },
    seenByUser:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId:  { type: mongoose.Schema.Types.ObjectId, ref: "TicketCategory" },
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status:      { type: String, enum: ["open", "in_progress", "closed"], default: "open" },
    messages:    [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
