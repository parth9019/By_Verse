const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    /* ================= PRODUCT NAME ================= */
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    /* ================= DESCRIPTION ================= */
    description: {
      type: String,
      required: true,
      trim: true,
    },

    /* ================= PRICE ================= */
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    /* ================= CATEGORY ================= */
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    /* ================= SUBCATEGORY ================= */
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: false, // Not all products might have a subcategory initially
    },

    /* ================= STOCK ================= */
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ================= ACTIVE STATUS ================= */
    isActive: {
      type: Boolean,
      default: true,
    },

    /* ================= PRIMARY IMAGE (BACKWARD SAFE) ================= */
    image: {
      type: String,
      required: true,
      trim: true,
    },

    /* ================= MULTIPLE IMAGES SUPPORT ================= */
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    /* ================= SELLER SUPPORT ================= */
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Admin products remain safe
      index: true,
    },

    /* ================= OPTIONAL PRODUCT METADATA ================= */
    views: {
      type: Number,
      default: 0,
    },

    soldCount: {
      type: Number,
      default: 0,
    },

    /* ================= REVIEWS & RATINGS ================= */
    reviews: [reviewSchema],

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* ================= SAFE EXPORT ================= */
module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);