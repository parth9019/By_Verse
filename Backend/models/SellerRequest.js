const mongoose = require("mongoose");

const sellerRequestSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One request per user
      index: true,
    },

    /* ================= BUSINESS INFO ================= */
    shopName: {
      type: String,
      required: true,
      trim: true,
    },

    gstNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    bankAccount: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    /* ================= ADMIN REVIEW ================= */

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who reviewed
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ================= SAFE EXPORT ================= */
module.exports =
  mongoose.models.SellerRequest ||
  mongoose.model("SellerRequest", sellerRequestSchema);
