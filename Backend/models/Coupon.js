const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // If array is populated, ONLY these emails can use the coupon
    allowedUsers: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
