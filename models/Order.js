// models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    meal:  { type: String, required: true },
    qty:   { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    tableNumber: { type: mongoose.Schema.Types.Mixed, required: true },
    waiterName:  { type: String, default: null },
    items:       [orderItemSchema],
    subtotal:    { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    // Where the order came from
    source: { type: String, enum: ["staff", "online"], default: "staff" },
    guestSessionId: { type: String, default: null }, // for online/customer orders
    customerName:   { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
export { orderItemSchema };
