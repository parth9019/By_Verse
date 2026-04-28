const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   GET /api/user/wishlist
 * @desc    Get user wishlist
 * @access  Private
 */
router.get("/wishlist", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      populate: { path: "seller", select: "shopName name" },
    });

    res.json(user.wishlist);
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    res.status(500).json({ message: "Failed to load wishlist" });
  }
});

/**
 * @route   POST /api/user/wishlist/:id
 * @desc    Add/Remove product to wishlist
 * @access  Private
 */
router.post("/wishlist/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    const alreadyAdded = user.wishlist.includes(req.params.id);

    if (alreadyAdded) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== req.params.id
      );
      await user.save();
      return res.json({ message: "Removed from wishlist", added: false });
    } else {
      // Add to wishlist
      user.wishlist.push(req.params.id);
      await user.save();
      return res.json({ message: "Added to wishlist", added: true });
    }
  } catch (error) {
    console.error("Wishlist action error:", error);
    res.status(500).json({ message: "Failed to update wishlist" });
  }
});

/* =======================================================
 *                    USER PROFILE API
 * ======================================================= */

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile data (e.g. name only)
 * @access  Private
 */
router.put("/profile", protect, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Safety check enforcing backend isolation.
    if (!name) {
      return res.status(400).json({ message: "Name is required for updating profile" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name: name.trim() } },
      { new: true } // Returns the modified DB document
    );

    // Completely synchronize the updated Name across all nested Product reviews globally
    await Product.updateMany(
      { "reviews.user": req.user._id },
      { $set: { "reviews.$[element].name": name.trim() } },
      { arrayFilters: [{ "element.user": req.user._id }] }
    );

    // Completely synchronize the updated Name backward onto all Historical order sheets
    const Order = require("../models/Order");
    await Order.updateMany(
      { user: req.user._id },
      { $set: { customerName: name.trim() } }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to securely update profile details" });
  }
});

/* =======================================================
 *                    ADDRESS BOOK API
 * ======================================================= */

/**
 * @route   GET /api/user/addresses
 * @desc    Get user's saved addresses
 */
router.get("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: "Failed to load addresses" });
  }
});

/**
 * @route   POST /api/user/addresses
 * @desc    Add a new address
 */
router.post("/addresses", protect, async (req, res) => {
  try {
    const { address, city, pincode, state, country } = req.body;
    if (!address || !city || !pincode || !state || !country) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findById(req.user._id);
    
    // First address auto-defaults to true
    const isDefault = user.addresses.length === 0;
    
    user.addresses.push({ address, city, pincode, state, country, isDefault });
    await user.save();
    
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: "Failed to save address" });
  }
});

/**
 * @route   PUT /api/user/addresses/:id/default
 * @desc    Set an address as default
 */
router.put("/addresses/:id/default", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    let targetFound = false;
    user.addresses.forEach((addr) => {
      if (addr._id.toString() === req.params.id) {
        addr.isDefault = true;
        targetFound = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!targetFound) return res.status(404).json({ message: "Address not found" });

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: "Failed to set default address" });
  }
});

/**
 * @route   DELETE /api/user/addresses/:id
 * @desc    Delete an address
 */
router.delete("/addresses/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.id);
    
    // If we deleted the default, auto-assign the next available
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete address" });
  }
});

module.exports = router;
