// models/Receipt.js
import mongoose from "mongoose";
import { orderItemSchema } from "./Order.js";

const receiptSchema = new mongoose.Schema(
  {
    billId: { type: String, required: true, unique: true },
    order:  { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    shift:  { type: mongoose.Schema.Types.ObjectId, ref: "Shift", default: null },

    tableNumber: { type: mongoose.Schema.Types.Mixed, required: true },
    waiterName:  { type: String, default: null },
    items:       [orderItemSchema],
    subtotal:    { type: Number, required: true },

    status: {
      type: String,
      enum: ["unpaid", "paid", "voided"],
      default: "unpaid",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "mpesa_till", "mpesa_paybill", "mpesa_pochi", null],
      default: null,
    },
    amountPaid:  { type: Number, default: null },
    changeGiven: { type: Number, default: null },

    voidReason: { type: String, default: null },
    printedAt:  { type: Date, default: null },
    paidAt:     { type: Date, default: null },
    printCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Receipt", receiptSchema);
