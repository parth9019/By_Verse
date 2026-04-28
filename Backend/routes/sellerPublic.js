const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

/* ===================================================== */
/* ============== GET SELLER STORE ===================== */
/* ===================================================== */

router.get("/:id", async (req, res) => {
  try {
    const sellerId = req.params.id;

    /* ===== VALIDATE OBJECT ID ===== */
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        message: "Invalid seller id",
      });
    }

    // 🔎 find seller user
    const seller = await User.findById(sellerId).select(
      "name shopName role"
    );

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    if (seller.role !== "seller") {
      return res.status(404).json({
        message: "User is not a seller",
      });
    }

    // 📦 get seller products
    const products = await Product.find({
      seller: sellerId,
      isActive: true,
    })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({
      seller,
      products,
    });

  } catch (error) {
    console.error("Seller store error:", error);
    res.status(500).json({
      message: "Failed to load seller store",
    });
  }
});

module.exports = router;