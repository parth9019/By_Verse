require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

/* ===================== CORE MIDDLEWARE ===================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  })
);

/* ===================== BASIC ROUTE ===================== */
app.get("/", (req, res) => {
  res.send("🚀 ShopKart API is running");
});

/* ===================== ROUTES ===================== */

// AUTH ROUTES (login, register, otp)
app.use("/api/auth", require("./routes/auth"));

// ADMIN ROUTES (categories, products, admin orders)
app.use("/api/admin", require("./routes/admin"));

// PUBLIC PRODUCT ROUTES
app.use("/api/products", require("./routes/product"));

// USER ORDER ROUTES
app.use("/api/orders", require("./routes/order"));

// SELLER PRIVATE ROUTES (seller dashboard operations)
app.use("/api/seller", require("./routes/seller"));

// USER GENERAL ROUTES (wishlist, profile data)
app.use("/api/user", require("./routes/user"));

// COUPONS & DISCOUNTS
app.use("/api/coupons", require("./routes/coupon"));

/* ===================================================== */
/* 🆕 SELLER PUBLIC STORE ROUTE (NEW FEATURE) */
/* ===================================================== */

app.use("/api/sellers", require("./routes/sellerPublic"));

/* ===================== ERROR HANDLER ===================== */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ===================== DATABASE ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});