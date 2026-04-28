const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ===================================================== */
/* ===================== PROTECT ======================== */
/* ===================================================== */

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated",
      });
    }

    // ✅ Attach clean user object to request
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      shopName: user.shopName,
    };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

/* ===================================================== */
/* ==================== ADMIN ONLY ====================== */
/* ===================================================== */

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only",
    });
  }
  next();
};

/* ===================================================== */
/* ==================== SELLER ONLY ===================== */
/* ===================================================== */

const sellerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "seller") {
    return res.status(403).json({
      message: "Seller access only",
    });
  }
  next();
};

/* ===================================================== */
/* ================= ADMIN OR SELLER ==================== */
/* ===================================================== */

const adminOrSeller = (req, res, next) => {
  if (!req.user || !["admin", "seller"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Admin or Seller access only",
    });
  }
  next();
};

module.exports = {
  protect,
  adminOnly,
  sellerOnly,
  adminOrSeller,
};
