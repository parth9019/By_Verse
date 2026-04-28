const express = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * =========================================================
 * @route   GET /api/products/categories
 * @desc    Get all active categories (PUBLIC)
 * @access  Public
 * =========================================================
 */
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);
    res.status(500).json({ message: "Failed to load categories" });
  }
});

/**
 * =========================================================
 * @route   GET /api/products
 * @desc    Get all active products (PUBLIC)
 * @access  Public
 * =========================================================
 */
router.get("/", async (req, res) => {
  try {
    const { q, category, subCategory, minPrice, maxPrice, rating, sort } = req.query;

    let filter = { isActive: true };

    // 1. Search by name or description
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }

    // 2. Category Filter
    if (category) {
      filter.category = category;
    }

    // 2.5 SubCategory Filter
    if (subCategory) {
      filter.subCategory = subCategory;
    }

    // 3. Price Filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 4. Rating Filter
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    // 5. Sorting Options
    let sortOptions = { createdAt: -1 }; // Default: Newest
    if (sort === "priceAsc") {
      sortOptions = { price: 1 };
    } else if (sort === "priceDesc") {
      sortOptions = { price: -1 };
    } else if (sort === "ratingDesc") {
      sortOptions = { rating: -1 };
    } else if (sort === "newest") {
      sortOptions = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("subCategory", "name")
      // ✅ IMPORTANT: include shopName
      .populate("seller", "shopName name email")
      .sort(sortOptions);

    res.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ message: "Failed to load products" });
  }
});

/**
 * =========================================================
 * @route   GET /api/products/:id
 * @desc    Get single product details
 * @access  Public
 * =========================================================
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("seller", "shopName name email");

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Fetch product error:", error);
    res.status(500).json({ message: "Failed to load product" });
  }
});

/**
 * =========================================================
 * @route   POST /api/products/:id/reviews
 * @desc    Create new review
 * @access  Private
 * =========================================================
 */
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user has purchased the product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "items.product": req.params.id,
      status: { $ne: "Cancelled" }, // Or specifically require "Delivered" if preferred
    });

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: !!hasPurchased,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Failed to add review" });
  }
});

module.exports = router;