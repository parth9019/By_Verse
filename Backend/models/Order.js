const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    /* ================= USER (REFERENCE) ================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ================= CUSTOMER SNAPSHOT ================= */
    // 🔒 Stored at order time (never changes)
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /* ================= ORDER ITEMS ================= */
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        // 🔒 SNAPSHOT DATA
        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        qty: {
          type: Number,
          required: true,
          min: 1,
        },

        image: {
          type: String,
        },
      },
    ],

    /* ================= SHIPPING ================= */
    shippingAddress: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    /* ================= PAYMENT ================= */

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ⭐ NEW FIELD for Coupons
    discountAmount: {
      type: Number,
      default: 0,
    },
    
    // ⭐ NEW FIELD for Coupons
    couponApplied: {
      type: String,
      default: null,
    },

    // ⭐ NEW FIELD
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    // ⭐ NEW FIELD
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    // ⭐ NEW FIELD
    transactionId: {
      type: String,
      default: null,
    },

    // ⭐ NEW FIELD
    paidAt: {
      type: Date,
      default: null,
    },

    /* ================= ORDER STATUS ================= */
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    /* ================= RETURNS & REFUNDS ================= */
    returnRequestStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected", "Refunded"],
      default: "None",
    },

    returnReason: {
      type: String,
      default: null,
    },

    refundStatus: {
      type: String,
      enum: ["None", "Pending", "Completed"],
      default: "None",
    },

    refundDate: {
      type: Date,
      default: null,
    },

    /* ================= STOCK SAFETY ================= */
    isStockRestored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= SAFE EXPORT ================= */
module.exports =
  mongoose.models.Order || mongoose.model("Order", orderSchema);