const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Coupon = require("../models/Coupon");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

/* ===================================================== */
/* ================= PUBLIC / USER ROUTES ============== */
/* ===================================================== */

// Validate a coupon before checkout
router.post("/validate", protect, async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code || !totalAmount) {
      return res.status(400).json({ message: "Coupon code and total amount are required." });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code." });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is no longer active." });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: "This coupon has expired." });
    }

    if (totalAmount < coupon.minOrderValue) {
      return res.status(400).json({ message: `A minimum cart value of ₹${coupon.minOrderValue} is required to use this coupon.` });
    }

    // Check if targeted user ONLY
    if (coupon.allowedUsers && coupon.allowedUsers.length > 0) {
      const userEmail = req.user.email.toLowerCase();
      if (!coupon.allowedUsers.includes(userEmail)) {
        return res.status(403).json({ message: "This coupon is not valid for your account." });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === "flat") {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed total amount
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    const finalTotal = totalAmount - discountAmount;

    res.json({
      valid: true,
      message: "Coupon applied successfully!",
      discountAmount: Math.round(discountAmount),
      finalTotal: Math.round(finalTotal),
      code: coupon.code,
    });
  } catch (error) {
    console.error("Coupon Validate Error:", error);
    res.status(500).json({ message: "Failed to validate coupon" });
  }
});


/* ===================================================== */
/* ================= PUBLIC / USER ROUTES ============== */

// Get all available coupons for the current user
router.get("/available", protect, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: now },
      $or: [
        { allowedUsers: { $size: 0 } }, // Public coupons
        { allowedUsers: userEmail } // Targeted to this user
      ]
    }).select("code discountType discountValue minOrderValue expiryDate").sort({ createdAt: -1 });

    res.json(coupons);
  } catch (error) {
    console.error("Fetch available coupons error:", error);
    res.status(500).json({ message: "Failed to load available coupons" });
  }
});

/* ===================================================== */
/* ================= ADMIN MANAGEMENT ROUTES =========== */
/* ===================================================== */

// Get all coupons (Admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to load coupons" });
  }
});

// Create a new coupon (Admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, expiryDate, allowedUsers } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: "Code, Type, Value, and Expiry are required." });
    }

    const exists = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "A coupon with this code already exists." });
    }

    // Parse allowedUsers manually if provided as comma-separated string
    let parsedUsers = [];
    if (allowedUsers && typeof allowedUsers === 'string') {
        parsedUsers = allowedUsers.split(',').map(email => email.trim().toLowerCase()).filter(email => email);
    } else if (Array.isArray(allowedUsers)) {
        parsedUsers = allowedUsers.map(email => email.trim().toLowerCase());
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      expiryDate,
      allowedUsers: parsedUsers,
    });

    // Audit Log
    await AuditLog.create({
      action: "COUPON_CREATED",
      performedBy: req.user._id,
      target: coupon.code,
      description: `Created new ${discountType} discount coupon.`,
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error("Create Coupon Error:", error);
    res.status(500).json({ message: "Failed to create coupon" });
  }
});

// Toggle Coupon Active Status (Admin)
router.put("/:id/toggle", protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle coupon status" });
  }
});

// Delete a coupon (Admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (coupon) {
      await AuditLog.create({
        action: "COUPON_DELETED",
        performedBy: req.user._id,
        target: coupon.code,
        description: `Permanently deleted coupon.`,
      });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete coupon" });
  }
});

module.exports = router;
