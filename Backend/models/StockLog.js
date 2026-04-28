const mongoose = require("mongoose");

const stockLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["ORDER_PLACED", "ORDER_CANCELLED", "RETURN_COMPLETED", "ADMIN_ADJUSTMENT"],
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantityChanged: {
      type: Number,
      required: true, // Example: -2 for an order, +2 for restock
    },
    updatedStock: {
      type: Number,
      required: true, // Absolute running total at time of execution
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.StockLog || mongoose.model("StockLog", stockLogSchema);
