const express = require("express");
const {
  protect,
  adminOnly,
  sellerOnly,
  adminOrSeller,
} = require("../middleware/authMiddleware");

const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");
const SellerRequest = require("../models/SellerRequest");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog"); // ✅ NEW: AUDIT SYSTEM
const SubCategory = require("../models/SubCategory");
const Coupon = require("../models/Coupon");
const StockLog = require("../models/StockLog");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_prevent_crash");

const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

/* ===================================================== */
/* ================= ADMIN DASHBOARD =================== */
/* ===================================================== */

router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments();
    const totalSubCategories = await SubCategory.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalCoupons = await Coupon.countDocuments({ isActive: true });

    // ⭐ CALCULATE ADMIN REVENUE: Exclude Seller Items, Exclude Cancelled AND Refunded Orders
    const orders = await Order.find().populate("items.product");

    let adminRevenue = 0;
    let sellerRevenue = 0;
    let successfulOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let returnedOrdersCount = 0;
    let rejectedReturnsCount = 0;

    orders.forEach((order) => {
      // If it's a Post-Delivery Return
      if (order.returnRequestStatus === "Rejected") {
        rejectedReturnsCount++;
        // mathematically a successful order; revenue is preserved.
      } else if (order.returnRequestStatus && order.returnRequestStatus !== "None") {
        returnedOrdersCount++;
        return; // Skip revenue calculation
      }

      // If it's a Pre-Delivery Cancellation
      if (order.status === "Cancelled") {
        cancelledOrdersCount++;
        return; // Skip revenue calculation
      }

      successfulOrdersCount++;

      order.items.forEach((item) => {
        if (item.product) {
          if (!item.product.seller) {
            adminRevenue += item.price * item.qty;
          } else {
            sellerRevenue += item.price * item.qty;
          }
        }
      });
    });

    res.json({
      totalCategories,
      totalSubCategories,
      totalProducts,
      totalUsers,
      totalCoupons,
      adminRevenue,
      sellerRevenue,
      successfulOrdersCount,
      cancelledOrdersCount,
      returnedOrdersCount,
      rejectedReturnsCount
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({ message: "Failed to load dashboard metrics" });
  }
});

/* ===================================================== */
/* ================= ADMIN ANALYTICS =================== */
/* ===================================================== */

router.get("/analytics", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate("items.product");

    const orderStatus = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueHistoryMap = {};

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      revenueHistoryMap[`${monthNames[d.getMonth()]} ${d.getFullYear()}`] = { admin: 0, seller: 0 };
    }

    orders.forEach((order) => {
      // Map Pie Chart Distributions
      if (order.status in orderStatus) {
        orderStatus[order.status]++;
      }

      // Map Line Chart 6-Month Rolling Revenue
      if (order.status !== "Cancelled" && order.paymentStatus !== "Refunded") {
        const orderDate = new Date(order.createdAt);
        const monthKey = `${monthNames[orderDate.getMonth()]} ${orderDate.getFullYear()}`;

        if (monthKey in revenueHistoryMap) {
          order.items.forEach((item) => {
            if (item.product) {
              if (!item.product.seller) { // Direct Retail Admin
                revenueHistoryMap[monthKey].admin += item.price * item.qty;
              } else { // Third Party Seller
                revenueHistoryMap[monthKey].seller += item.price * item.qty;
              }
            }
          });
        }
      }
    });

    const pieData = Object.keys(orderStatus).map((key) => ({ name: key, value: orderStatus[key] }));
    const lineData = Object.keys(revenueHistoryMap).map((key) => ({
      name: key,
      Platform: revenueHistoryMap[key].admin,
      Sellers: revenueHistoryMap[key].seller
    }));

    res.json({ pieData, lineData });
  } catch (error) {
    console.error("Admin Analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

/* 🔥 GET AUDIT LOGS */
router.get("/audits", protect, adminOnly, async (req, res) => {
  try {
    const audits = await AuditLog.find()
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 })
      .limit(200); // Prevent massive payloads, keep history snappy
    res.json(audits);
  } catch (error) {
    console.error("Fetch audits error:", error);
    res.status(500).json({ message: "Failed to load audit logs" });
  }
});

/* 🔥 GET STOCK LOGS */
router.get("/stock-logs", protect, adminOnly, async (req, res) => {
  try {
    const logs = await StockLog.find()
      .populate("productId", "name image price")
      .populate("orderId", "_id")
      .sort({ createdAt: -1 })
      .limit(300);
    res.json(logs);
  } catch (error) {
    console.error("Fetch stock logs error:", error);
    res.status(500).json({ message: "Failed to load stock logs" });
  }
});

/* ===================================================== */
/* ================= SELLER REQUESTS =================== */
/* ===================================================== */

/* 🔥 GET ALL SELLER REQUESTS */
router.get("/seller-requests", protect, adminOnly, async (req, res) => {
  try {
    const requests = await SellerRequest.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Fetch seller requests error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* 🔥 APPROVE SELLER */
router.put(
  "/seller-requests/:id/approve",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const request = await SellerRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status === "approved") {
        return res.status(400).json({ message: "Already approved" });
      }

      if (request.status === "rejected") {
        return res.status(400).json({
          message: "Rejected request cannot be approved",
        });
      }

      // ✅ Update request status
      request.status = "approved";
      await request.save();

      // ✅ Update user role to seller
      await User.findByIdAndUpdate(request.user, {
        role: "seller",
        shopName: request.shopName
      });

      // 📜 AUDIT LOG
      await AuditLog.create({
        action: "SELLER_APPROVED",
        performedBy: req.user._id,
        target: request.shopName,
        description: `Approved seller request for ${request.shopName}`,
      });

      res.json({
        message: "Seller approved successfully",
        request,
      });
    } catch (error) {
      console.error("Approve seller error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* 🔥 REJECT SELLER */
router.put(
  "/seller-requests/:id/reject",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const request = await SellerRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status === "approved") {
        return res.status(400).json({
          message: "Approved seller cannot be rejected",
        });
      }

      request.status = "rejected";
      await request.save();

      res.json({
        message: "Seller request rejected",
        request,
      });
    } catch (error) {
      console.error("Reject seller error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* ===================================================== */
/* ================= MANAGE SELLERS & USERS ============ */
/* ===================================================== */

/* 🔥 GET ALL SELLERS */
router.get("/sellers", protect, adminOnly, async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" }).select("-password").sort({ createdAt: -1 });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* 🔥 GET ALL USERS (CUSTOMERS) */
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("name email").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* 🔥 DELETE SELLER AND CASCADE DELETE PRODUCTS */
router.delete("/sellers/:id", protect, adminOnly, async (req, res) => {
  try {
    const sellerId = req.params.id;
    const seller = await User.findById(sellerId);

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    // 1. Delete all products belonging to this seller
    await Product.deleteMany({ seller: sellerId });

    // 2. Delete the seller account
    await User.findByIdAndDelete(sellerId);

    // Optional: Delete their initial seller request to clean up admin dashboard
    await SellerRequest.findOneAndDelete({ user: sellerId });

    // 📜 AUDIT LOG
    await AuditLog.create({
      action: "SELLER_DELETED",
      performedBy: req.user._id,
      target: seller.email,
      description: `Permanently deleted seller account: ${seller.name} (${seller.email}) and purged all inherited inventory.`,
    });

    res.json({ message: "Seller account and all their products have been permanently deleted." });
  } catch (error) {
    console.error("Delete seller error:", error);
    res.status(500).json({ message: "Failed to delete seller and their products" });
  }
});

/* ===================================================== */
/* ================= CATEGORY CRUD ===================== */
/* ===================================================== */

/* ✅ VIEW CATEGORIES (Admin + Seller) */
router.get("/categories", protect, adminOrSeller, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ✅ CREATE CATEGORY (Admin Only) */
router.post("/categories", protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Name is required" });

    const exists = await Category.findOne({ name });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Category already exists" });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ✅ DELETE CATEGORY AND CASCADE DELETE PRODUCTS/SUBCATEGORIES (Admin Only) */
router.delete("/categories/:id", protect, adminOnly, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findByIdAndDelete(categoryId);
    if (category) {
      // 1. Delete all products belonging to this category
      await Product.deleteMany({ category: categoryId });

      // 2. Delete all subcategories belonging to this category
      await SubCategory.deleteMany({ category: categoryId });

      // 📜 AUDIT LOG
      await AuditLog.create({
        action: "CATEGORY_DELETED",
        performedBy: req.user._id,
        target: category.name,
        description: `Deleted catalog category: ${category.name} and purged all associated products and subcategories`,
      });
    }
    res.json({ message: "Category and all related products deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================================================== */
/* ================= SUBCATEGORY CRUD ================== */
/* ===================================================== */

/* ✅ VIEW SUBCATEGORIES (Admin + Seller) */
router.get("/subcategories", protect, adminOrSeller, async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate("category", "name").sort({ createdAt: -1 });
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ✅ VIEW SUBCATEGORIES BY CATEGORY (Admin + Seller) */
router.get("/categories/:categoryId/subcategories", protect, adminOrSeller, async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ category: req.params.categoryId }).sort({ createdAt: -1 });
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ✅ CREATE SUBCATEGORY (Admin Only) */
router.post("/subcategories", protect, adminOnly, async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category)
      return res.status(400).json({ message: "Name and Category are required" });

    const exists = await SubCategory.findOne({ name, category });
    if (exists) {
      return res.status(400).json({ message: "SubCategory already exists in this category" });
    }

    const subCategory = await SubCategory.create({ name, category });
    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ✅ DELETE SUBCATEGORY AND CASCADE DELETE PRODUCTS (Admin Only) */
router.delete("/subcategories/:id", protect, adminOnly, async (req, res) => {
  try {
    const subCategoryId = req.params.id;
    const subCategory = await SubCategory.findByIdAndDelete(subCategoryId);
    if (subCategory) {
      // 1. Delete all products belonging to this subcategory
      await Product.deleteMany({ subCategory: subCategoryId });

      await AuditLog.create({
        action: "SUBCATEGORY_DELETED",
        performedBy: req.user._id,
        target: subCategory.name,
        description: `Deleted catalog subcategory: ${subCategory.name} and purged all associated products`,
      });
    }
    res.json({ message: "SubCategory and all related products deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/* ===================================================== */
/* ================= PRODUCT CRUD ====================== */
/* ===================================================== */

router.get("/products", protect, adminOrSeller, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "seller") {
      query.seller = req.user._id;
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= CREATE PRODUCT ================= */

router.post(
  "/products",
  protect,
  adminOrSeller,

  // ✅ Accept main image + multiple images
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 5 }
  ]),

  async (req, res) => {
    try {
      const { name, description, price, stock, category, subCategory, status } =
        req.body;

      if (!name || !description || !price || !category) {
        return res
          .status(400)
          .json({ message: "Missing required fields" });
      }

      const mainImage = req.files?.image?.[0];
      const extraImages = req.files?.images || [];

      // ❌ If no main image
      if (!mainImage) {
        return res
          .status(400)
          .json({ message: "Product image is required" });
      }

      /* ================= MAIN IMAGE ================= */

      const mainUpload = await cloudinary.uploader.upload(
        mainImage.path,
        {
          folder: "products",
        }
      );

      /* ================= EXTRA IMAGES ================= */

      const uploadedImages = [];

      for (const file of extraImages) {
        const result = await cloudinary.uploader.upload(
          file.path,
          {
            folder: "products",
          }
        );

        uploadedImages.push(result.secure_url);
      }

      /* ================= CREATE PRODUCT ================= */

      const product = await Product.create({
        name,
        description,
        price,
        stock,
        category,
        subCategory: subCategory || undefined,
        isActive: status === "active",

        image: mainUpload.secure_url,   // main image
        images: uploadedImages,         // extra images

        seller:
          req.user.role === "seller"
            ? req.user._id
            : null,
      });

      res.status(201).json(product);

    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* ================= UPDATE PRODUCT ================= */

router.put(
  "/products/:id",
  protect,
  adminOrSeller,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res
          .status(404)
          .json({ message: "Product not found" });
      }

      if (
        req.user.role === "seller" &&
        product.seller?.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not allowed" });
      }

      const {
        name,
        description,
        price,
        stock,
        category,
        subCategory,
        status,
      } = req.body;

      let imageUrl = product.image;
      const mainImage = req.files?.image?.[0];
      const extraImages = req.files?.images || [];

      if (mainImage) {
        const uploadResult =
          await cloudinary.uploader.upload(mainImage.path, {
            folder: "products",
          });
        imageUrl = uploadResult.secure_url;
      }

      let extraImageUrls = product.images || [];
      if (extraImages.length > 0) {
        for (const file of extraImages) {
          const result = await cloudinary.uploader.upload(
            file.path,
            { folder: "products" }
          );
          extraImageUrls.push(result.secure_url);
        }
      }

      product.name = name ?? product.name;
      product.description =
        description ?? product.description;
      product.price = price ?? product.price;
      product.stock = stock ?? product.stock;
      product.category = category ?? product.category;
      product.subCategory = subCategory !== undefined ? subCategory : product.subCategory;
      product.isActive = status === "active";
      product.image = imageUrl;
      product.images = extraImageUrls;

      await product.save();

      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

/* ================= DELETE PRODUCT ================= */

router.delete(
  "/products/:id",
  protect,
  adminOrSeller,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res
          .status(404)
          .json({ message: "Product not found" });
      }

      if (
        req.user.role === "seller" &&
        product.seller?.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not allowed" });
      }

      await product.deleteOne();

      // 📜 AUDIT LOG
      await AuditLog.create({
        action: "PRODUCT_DELETED",
        performedBy: req.user._id,
        target: product.name,
        description: `Deleted product: ${product.name} (Price: ${product.price})`,
      });

      res.json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ===================================================== */
/* ================= ADMIN ORDERS ====================== */
/* ===================================================== */

router.get("/orders", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "name seller image images",
        populate: { path: "seller", select: "name shopName" }
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("ADMIN ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

router.put(
  "/orders/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatus = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status" });
      }

      const order = await Order.findById(
        req.params.id
      ).populate("items.product");

      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found" });
      }

      // 🛑 BLOCK ANY MUTATIONS ON CANCELLED OR DELIVERED ORDERS
      if (order.status === "Cancelled") {
        return res
          .status(400)
          .json({ message: "This order has already been cancelled and cannot be modified." });
      }

      if (order.status === "Delivered") {
        return res
          .status(400)
          .json({ message: "This order has already been delivered and cannot be modified." });
      }

      if (
        status === "Cancelled" &&
        order.status !== "Cancelled" &&
        !order.isStockRestored
      ) {
        for (const item of order.items) {
          if (item.product) {
            const updatedProduct = await Product.findByIdAndUpdate(
              item.product._id,
              { $inc: { stock: item.qty } },
              { new: true }
            );

            if (updatedProduct) {
              await StockLog.create({
                action: "ORDER_CANCELLED",
                productId: updatedProduct._id,
                quantityChanged: item.qty,
                updatedStock: updatedProduct.stock,
                orderId: order._id
              });
            }
          }
        }
        order.isStockRestored = true;
      }

      const updatedOrder =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            status,
            isStockRestored:
              status === "Cancelled"
                ? true
                : order.isStockRestored,
            ...(status === "Delivered" && !order.deliveredAt && { deliveredAt: new Date() }),
          },
          {
            new: true,
            runValidators: false,
          }
        );

      // 📜 Extract Human Readable Product Names
      const productNames = order.items
        .map(item => item.product ? item.product.name : 'Deleted Product')
        .join(', ');

      // 📜 AUDIT LOG
      await AuditLog.create({
        action: "ORDER_STATUS_UPDATED",
        performedBy: req.user._id,
        target: productNames,
        description: `Updated global order status to ${status} (Total: ₹${updatedOrder.totalAmount})`,
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error(
        "ORDER STATUS UPDATE ERROR:",
        error
      );
      res
        .status(500)
        .json({
          message: "Failed to update order status",
        });
    }
  }
);

/* ================= APPROVE RETURN REQUEST ================= */
router.put("/orders/:id/return-approve", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.returnRequestStatus !== "Requested") {
      return res.status(400).json({ message: "Order does not have a pending return request." });
    }

    order.returnRequestStatus = "Approved";
    await order.save();

    res.json({ message: "Return request explicitly approved. Awaiting physical pickup.", order });
  } catch (error) {
    console.error("Approve return error:", error);
    res.status(500).json({ message: "Failed to approve return request" });
  }
});

/* ================= REJECT RETURN REQUEST ================= */
router.put("/orders/:id/return-reject", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.returnRequestStatus !== "Requested") {
      return res.status(400).json({ message: "Order does not have a pending return request." });
    }

    order.returnRequestStatus = "Rejected";
    await order.save();

    res.json({ message: "Return request rejected.", order });
  } catch (error) {
    console.error("Reject return error:", error);
    res.status(500).json({ message: "Failed to reject return request" });
  }
});

/* ================= EXECUTE REFUND ================= */
router.put("/orders/:id/return-refund", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.returnRequestStatus !== "Approved") {
      return res.status(400).json({ message: "Return request must be approved before issuing a refund." });
    }

    // ⭐ AUTOMATED STRIPE REFUND LOGIC
    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "Paid" && order.transactionId) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ message: "Refund failed: STRIPE_SECRET_KEY is missing." });
      }

      try {
        await stripe.refunds.create({
          payment_intent: order.transactionId,
        });
      } catch (refundError) {
        if (refundError.code === 'charge_already_refunded') {
          console.warn("Stripe sync: Charge already refunded on Stripe end. Bypassing.");
        } else {
          console.error("Stripe Auto-Refund Error:", refundError);
          return res.status(400).json({
            message: "Refund halted: Automatic Stripe refund failed. " + refundError.message
          });
        }
      }
    }

    // Restore Stock since item was successfully returned
    if (!order.isStockRestored) {
      for (const item of order.items) {
        if (item.product) {
          const updatedProduct = await Product.findByIdAndUpdate(
            item.product._id,
            { $inc: { stock: item.qty } },
            { new: true }
          );

          if (updatedProduct) {
            await StockLog.create({
              action: "RETURN_COMPLETED",
              productId: updatedProduct._id,
              quantityChanged: item.qty,
              updatedStock: updatedProduct.stock,
              orderId: order._id
            });
          }
        }
      }
      order.isStockRestored = true;
    }

    order.paymentStatus = "Refunded";
    order.refundStatus = "Completed";
    order.refundDate = new Date();
    order.returnRequestStatus = "Refunded";

    await order.save();

    res.json({ message: "Refund executed securely and stock restored.", order });
  } catch (error) {
    console.error("Execute refund error:", error);
    res.status(500).json({ message: "Failed to securely execute refund" });
  }
});

/* ===================================================== */
/* ============= SELLERS REVENUE BREAKDOWN ============= */
/* ===================================================== */

router.get("/sellers-revenue", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate({
      path: "items.product",
      populate: { path: "seller", select: "name email" }
    });

    const sellerStatsMap = {};

    orders.forEach((order) => {
      // Only count successful finalized transactions. Rejected returns are kept revenue.
      if (order.status === "Cancelled" || (order.returnRequestStatus && order.returnRequestStatus !== "None" && order.returnRequestStatus !== "Rejected")) {
        return;
      }

      order.items.forEach(item => {
        if (item.product && item.product.seller) {
          const sellerId = item.product.seller._id.toString();

          if (!sellerStatsMap[sellerId]) {
            sellerStatsMap[sellerId] = {
              seller: item.product.seller,
              revenue: 0,
              itemsSold: 0,
            };
          }

          sellerStatsMap[sellerId].revenue += item.price * item.qty;
          sellerStatsMap[sellerId].itemsSold += item.qty;
        }
      });
    });

    const sellerList = Object.values(sellerStatsMap).sort((a, b) => b.revenue - a.revenue);

    res.json(sellerList);
  } catch (error) {
    console.error("Seller Revenue Breakdown Error:", error);
    res.status(500).json({ message: "Failed to generate seller revenue report" });
  }
});

/* ===================================================== */
/* ================= STOCKLOG ENGINE =================== */
/* ===================================================== */

router.get("/stocklogs", protect, adminOnly, async (req, res) => {
  try {
    const logs = await StockLog.find()
      .populate("productId", "name image")
      .populate("orderId", "_id")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error("Failed to fetch StockLogs:", error);
    res.status(500).json({ message: "Failed to fetch stock tracking ledger" });
  }
});

/* ===================================================== */
/* ================= SYSTEM REPORTS ==================== */
/* ===================================================== */

router.get("/reports/sales", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "seller")
      .sort({ createdAt: -1 });

    const formattedSales = orders.map((o) => {
      let adminRev = 0;
      let sellerRev = 0;

      // Ensure cancelled/returned logic flows accurately in report
      if (
        o.status !== "Cancelled" &&
        (!o.returnRequestStatus || o.returnRequestStatus === "None" || o.returnRequestStatus === "Rejected")
      ) {
        o.items.forEach((item) => {
          if (item.product && item.product.seller) {
            sellerRev += item.price * item.qty;
          } else {
            adminRev += item.price * item.qty;
          }
        });
      }

      const formatDate = (d) => d ? ` ${new Date(d).toISOString().split('T')[0]} ` : "N/A";

      return {
        OrderID: o._id || "N/A",
        OrderDate: formatDate(o.createdAt),
        OrderTime: o.createdAt ? new Date(o.createdAt).toLocaleTimeString('en-US', { hour12: false }) : "N/A",
        LastUpdatedDate: formatDate(o.updatedAt),
        Customer: (o.user && o.user.name) ? o.user.name : "Guest",
        Email: (o.user && o.user.email) ? o.user.email : "N/A",
        PaymentMethod: o.paymentMethod || o.paymentRoute || "N/A",
        PaymentStatus: o.paymentStatus === "Paid" ? "Completed" : (o.paymentStatus || "Pending"),
        DeliveryStatus: o.status || "Processing",
        ReturnStatus: o.returnRequestStatus || "None",
        DiscountGiven: o.discountAmount || 0,
        GrossTotal: o.totalAmount || 0,
        AdminRevenue: adminRev || 0,
        SellerRevenue: sellerRev || 0,
      };
    });

    res.json(formattedSales);
  } catch (error) {
    console.error("Sales Report Error:", error);
    res.status(500).json({ message: "Failed to generate sales report" });
  }
});

router.get("/reports/sellers", protect, adminOnly, async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" }).lean();
    const orders = await Order.find({ status: { $ne: "Cancelled" } }).populate("items.product");
    const requests = await SellerRequest.find({ status: "approved" }).lean();

    const sellerReport = await Promise.all(
      sellers.map(async (s) => {
        const totalProducts = await Product.countDocuments({ seller: s._id });
        const lastAudit = await AuditLog.findOne({ performedBy: s._id }).sort({ createdAt: -1 }).lean();
        const activityTimestamp = lastAudit ? lastAudit.createdAt : s.updatedAt;

        let totalItemsSold = 0;
        let totalRevenue = 0;

        orders.forEach((o) => {
          if (o.returnRequestStatus && o.returnRequestStatus !== "None" && o.returnRequestStatus !== "Rejected") {
            return; // Skip successful returns
          }
          o.items.forEach(item => {
            if (item.product && item.product.seller && item.product.seller.toString() === s._id.toString()) {
              totalItemsSold += item.qty;
              totalRevenue += (item.price * item.qty);
            }
          });
        });

        const matchingRequest = requests.find(r => r.user.toString() === s._id.toString());

        // Strict fallback chain to prevent ANY blanks
        let safeDate;
        if (matchingRequest && matchingRequest.approvedAt) {
          safeDate = matchingRequest.approvedAt;
        } else if (matchingRequest && matchingRequest.updatedAt) {
          safeDate = matchingRequest.updatedAt;
        } else if (s.createdAt) {
          safeDate = s.createdAt;
        } else if (s.updatedAt) {
          safeDate = s.updatedAt;
        } else {
          safeDate = new Date(); // Absolute last resort fallback to guarantee no crashes
        }

        const validDate = new Date(safeDate);

        const formatStrictDate = (d) => {
          if (!d) return "N/A";
          const date = new Date(d);
          return isNaN(date.getTime()) ? "N/A" : `="` + date.toISOString().split('T')[0] + `"`;
        };

        return {
          SellerID: s._id || "N/A",
          ShopName: s.shopName || "Unnamed Store",
          OwnerName: s.name || "Unknown",
          Email: s.email || "N/A",
          Status: s.isActive === false ? "Suspended" : "Approved",
          JoinedDate: formatStrictDate(validDate),
          JoinedTime: !isNaN(validDate.getTime()) ? validDate.toLocaleTimeString('en-US', { hour12: false }) : "N/A",
          LastActivityDate: formatStrictDate(activityTimestamp),
          ProductsListed: totalProducts || 0,
          TotalItemsSold: totalItemsSold || 0,
          GrossRevenue: totalRevenue || 0
        };
      })
    );

    res.json(sellerReport);
  } catch (error) {
    console.error("Seller Report Error:", error);
    res.status(500).json({ message: "Failed to generate seller report" });
  }
});

module.exports = router;
