const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },

    // ✅ PERMANENT SELLER BUSINESS NAME
    shopName: {
      type: String,
      trim: true,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    // ⭐ NEW FIELD: ADDRESS BOOK
    addresses: [
      {
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);