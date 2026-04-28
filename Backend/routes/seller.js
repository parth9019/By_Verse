const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const SellerRequest = require("../models/SellerRequest");
const Order = require("../models/Order");
const Product = require("../models/Product");
const StockLog = require("../models/StockLog");

const router = express.Router();

/* ===================================================== */
/* ================= APPLY FOR SELLER ================== */
/* ===================================================== */

router.post("/apply", protect, async (req, res) => {
  try {
    const { shopName, gstNumber, bankAccount, ifscCode } = req.body;

    if (!shopName || !gstNumber || !bankAccount || !ifscCode) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Admin cannot apply for seller account",
      });
    }

    if (req.user.role === "seller") {
      return res.status(400).json({
        message: "You are already a seller",
      });
    }

    const existing = await SellerRequest.findOne({
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already applied for seller account",
        status: existing.status,
      });
    }

    const request = await SellerRequest.create({
      user: req.user._id,
      shopName: shopName.trim(),
      gstNumber: gstNumber.trim(),
      bankAccount: bankAccount.trim(),
      ifscCode: ifscCode.trim(),
    });

    res.status(201).json({
      message: "Seller request submitted successfully",
      request,
    });

  } catch (error) {
    console.error("Seller Apply Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/* ===================================================== */
/* ========== GET MY SELLER APPLICATION STATUS ========= */
/* ===================================================== */

router.get("/my-request", protect, async (req, res) => {
  try {
    const request = await SellerRequest.findOne({
      user: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        message: "No seller application found",
      });
    }

    res.json(request);

  } catch (error) {
    console.error("Fetch Seller Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/* ===================================================== */
/* ================= SELLER ORDERS ===================== */
/* ===================================================== */

router.get("/orders", protect, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        message: "Seller access only",
      });
    }

    const orders = await Order.find()
      .populate({
        path: "items.product",
        select: "name seller price",
      })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    let totalRevenue = 0;
    let totalItemsSold = 0;

    const sellerOrders = orders
      .map((order) => {

        const sellerItems = order.items.filter(
          (item) =>
            item.product?.seller?.toString() ===
            req.user._id.toString()
        );

        if (sellerItems.length === 0) return null;

        sellerItems.forEach((item) => {
          totalRevenue += item.price * item.qty;
          totalItemsSold += item.qty;
        });

        return {
          ...order.toObject(),
          items: sellerItems,
        };

      })
      .filter(Boolean);

    res.json({
      summary: {
        totalOrders: sellerOrders.length,
        totalRevenue,
        totalItemsSold,
      },
      orders: sellerOrders,
    });

  } catch (error) {
    console.error("Seller orders error:", error);
    res.status(500).json({
      message: "Failed to load seller orders",
    });
  }
});


/* ===================================================== */
/* ================= UPDATE ORDER STATUS ================= */
/* ===================================================== */

router.put("/orders/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Seller access only" });
    }

    const { status } = req.body;
    const allowedStatus = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!allowedStatus.includes(status)) {
       return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id).populate("items.product");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🛑 BLOCK ANY MUTATIONS ON CANCELLED OR DELIVERED ORDERS
    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "This order has already been cancelled and cannot be modified." });
    }
    
    if (order.status === "Delivered") {
      return res.status(400).json({ message: "This order has already been delivered and cannot be modified." });
    }

    // 🔒 Verify Seller Authorization: Seller MUST own at least one item in this order
    const hasSellerItem = order.items.some(
      (item) => item.product?.seller?.toString() === req.user._id.toString()
    );

    if (!hasSellerItem) {
      return res.status(403).json({ message: "You are not authorized to modify the shipping status of this order as it contains no products from your catalog." });
    }

    // Restore stock if cancelled (Standard logic replication)
    if (status === "Cancelled" && order.status !== "Cancelled" && !order.isStockRestored) {
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

    order.status = status;
    if (status === "Delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    await order.save();

    // 📜 AUDIT LOG: Extract Seller-Only Product Names
    const AuditLog = require("../models/AuditLog");
    const sellerProductNames = order.items
      .filter((item) => item.product && item.product.seller?.toString() === req.user._id.toString())
      .map((item) => item.product.name)
      .join(', ');

    // 📜 Create the Record
    await AuditLog.create({
      action: "ORDER_STATUS_UPDATED",
      performedBy: req.user._id,
      target: sellerProductNames || "Unknown Item",
      description: `Updated fulfillment status to ${status}.`,
    });

    res.json(order);
  } catch (error) {
    console.error("Seller update status error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});


/* ===================================================== */
/* ================= SELLER DASHBOARD ================== */
/* ===================================================== */

router.get("/dashboard", protect, async (req, res) => {
  try {

    if (req.user.role !== "seller") {
      return res.status(403).json({
        message: "Seller access only",
      });
    }

    const sellerId = req.user._id;

    /* ===== TOTAL PRODUCTS ===== */
    const totalProducts = await Product.countDocuments({
      seller: sellerId,
    });

    /* ===== FIND SELLER ORDERS ===== */
    const orders = await Order.find()
      .populate("items.product");

    let totalRevenue = 0;
    let totalItemsSold = 0;
    let totalOrders = 0;
    let successfulOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let returnedOrdersCount = 0;
    let rejectedReturnsCount = 0;

    orders.forEach((order) => {

      const sellerItems = order.items.filter(
        (item) =>
          item.product?.seller?.toString() ===
          sellerId.toString()
      );

      if (sellerItems.length === 0) return;

      totalOrders++;

      if (order.returnRequestStatus === "Rejected") {
        rejectedReturnsCount++;
        // Do NOT return here. A rejected return is mathematically a successful order, revenue is kept.
      } else if (order.returnRequestStatus && order.returnRequestStatus !== "None") {
        returnedOrdersCount++;
        return; 
      }

      if (order.status === "Cancelled") {
        cancelledOrdersCount++;
        return; 
      }

      successfulOrdersCount++;

      sellerItems.forEach((item) => {
        totalRevenue += item.price * item.qty;
        totalItemsSold += item.qty;
      });

    });

    res.json({
      shopName: req.user.shopName,
      totalProducts,
      totalOrders,
      totalRevenue,
      totalItemsSold,
      successfulOrdersCount,
      cancelledOrdersCount,
      returnedOrdersCount,
      rejectedReturnsCount
    });

  } catch (error) {
    console.error("Seller dashboard error:", error);
    res.status(500).json({
      message: "Failed to load seller dashboard",
    });
  }
});


/* ===================================================== */
/* ================= SELLER ANALYTICS ================== */
/* ===================================================== */

router.get("/analytics", protect, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Seller access only" });
    }

    const sellerId = req.user._id;
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
       revenueHistoryMap[`${monthNames[d.getMonth()]} ${d.getFullYear()}`] = 0;
    }

    orders.forEach((order) => {
      // 🔒 Exclusively filter items mapped to this seller
      const sellerItems = order.items.filter(
        (item) => item.product?.seller?.toString() === sellerId.toString()
      );

      if (sellerItems.length === 0) return; // Order is unrelated to this Seller

      if (order.status in orderStatus) {
        orderStatus[order.status]++;
      }

      if (order.status !== "Cancelled" && order.paymentStatus !== "Refunded") {
        const orderDate = new Date(order.createdAt);
        const monthKey = `${monthNames[orderDate.getMonth()]} ${orderDate.getFullYear()}`;
        
        if (monthKey in revenueHistoryMap) {
          sellerItems.forEach((item) => {
            revenueHistoryMap[monthKey] += item.price * item.qty;
          });
        }
      }
    });

    const pieData = Object.keys(orderStatus).map((key) => ({ name: key, value: orderStatus[key] }));
    const lineData = Object.keys(revenueHistoryMap).map((key) => ({ name: key, revenue: revenueHistoryMap[key] }));

    res.json({ pieData, lineData });
  } catch (error) {
    console.error("Seller Analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});


/* ================= SELLER RETURN APPROVE ================= */
router.put("/orders/:id/return-approve", protect, async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ message: "Seller access only" });
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    const hasSellerItem = order.items.some(i => i.product?.seller?.toString() === req.user._id.toString());
    if (!hasSellerItem) return res.status(403).json({ message: "Not authorized for this order." });
    if (order.returnRequestStatus !== "Requested") return res.status(400).json({ message: "No pending return." });
    
    order.returnRequestStatus = "Approved";
    await order.save();
    res.json({ message: "Return approved.", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve return." });
  }
});

/* ================= SELLER RETURN REJECT ================= */
router.put("/orders/:id/return-reject", protect, async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ message: "Seller access only" });
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    const hasSellerItem = order.items.some(i => i.product?.seller?.toString() === req.user._id.toString());
    if (!hasSellerItem) return res.status(403).json({ message: "Not authorized for this order." });
    if (order.returnRequestStatus !== "Requested") return res.status(400).json({ message: "No pending return." });
    
    order.returnRequestStatus = "Rejected";
    await order.save();
    res.json({ message: "Return rejected.", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject return." });
  }
});

module.exports = router;