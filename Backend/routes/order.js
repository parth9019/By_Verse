const express = require("express");
const mongoose = require("mongoose");
const { protect } = require("../middleware/authMiddleware");

const Order = require("../models/Order");
const Product = require("../models/Product");
const StockLog = require("../models/StockLog");

// Initialize Stripe (requires STRIPE_SECRET_KEY in .env)
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_prevent_crash");

const router = express.Router();

/* ================= CREATE ORDER ================= */
router.post("/", protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, totalAmount, shippingAddress, paymentMethod, discountAmount, couponApplied } = req.body;

    if (!items || items.length === 0) {
      throw new Error("No order items");
    }

    /* ================= PAYMENT LOGIC ================= */

    let paymentStatus = "Pending";
    let txnId = null;
    let paidAt = null;

    if (paymentMethod === "ONLINE") {
      // ⭐ ENFORCE VERIFICATION: Must receive a gateway transaction ID
      if (!req.body.transactionId) {
        throw new Error("Payment verification failed. Missing transaction ID.");
      }
      paymentStatus = "Paid";
      txnId = req.body.transactionId;
      paidAt = new Date();
    }

    if (paymentMethod === "COD") {
      paymentStatus = "Pending";
    }

    /* ================= CHECK & REDUCE STOCK ================= */

    let stockLogsPayload = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock < item.qty) {
        throw new Error(`Only ${product.stock} left for ${product.name}`);
      }

      product.stock -= item.qty;
      await product.save({ session });

      stockLogsPayload.push({
         action: "ORDER_PLACED",
         productId: product._id,
         quantityChanged: -item.qty,
         updatedStock: product.stock,
      });
    }

    /* ================= CREATE ORDER ================= */

    const order = await Order.create(
      [
        {
          user: req.user._id,
          customerName: req.user.name,
          customerEmail: req.user.email,

          items,
          totalAmount,
          discountAmount: discountAmount || 0,
          couponApplied: couponApplied || null,
          shippingAddress,

          paymentMethod: paymentMethod || "COD",
          paymentStatus,
          transactionId: txnId,
          paidAt,

          status: "Pending",
        },
      ],
      { session }
    );

    // 📜 Generate Immutable Stock Trail within the ACID context
    if (stockLogsPayload.length > 0) {
      stockLogsPayload = stockLogsPayload.map(log => ({ ...log, orderId: order[0]._id }));
      await StockLog.create(stockLogsPayload, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Order creation error:", error.message);
    res.status(400).json({ message: error.message });
  }
});

/* ================= STRIPE PAYMENT INTENT ================= */
router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return res.status(400).json({ message: "totalAmount is required" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: "STRIPE_SECRET_KEY is not configured in .env" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to subunits (paise/cents)
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Intent Error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= GET MY ORDERS ================= */
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("MY ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

/* ================= GET SINGLE ORDER ================= */
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Failed to load order" });
  }
});

/* ================= PAY ORDER ================= */
router.put("/:id/pay", protect, async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (paymentMethod === "ONLINE") {
      order.paymentMethod = "ONLINE";
      order.paymentStatus = "Paid";
      order.transactionId = "TXN_" + Date.now();
      order.paidAt = new Date();
    }

    if (paymentMethod === "COD") {
      order.paymentMethod = "COD";
      order.paymentStatus = "Pending";
    }

    await order.save();

    res.json({
      message: "Payment updated",
      order,
    });

  } catch (error) {
    console.error("Payment update error:", error);
    res.status(500).json({ message: "Payment update failed" });
  }
});

/* ================= CANCEL ORDER (USER) ================= */
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (["Shipped", "Delivered"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled now" });
    }

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

    // ⭐ NEW: AUTOMATED STRIPE REFUND LOGIC
    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "Paid" && order.transactionId) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ message: "Refund failed: STRIPE_SECRET_KEY is missing." });
      }
      
      try {
        await stripe.refunds.create({
          payment_intent: order.transactionId,
        });
        order.paymentStatus = "Refunded";
        order.refundStatus = "Completed";
        order.refundDate = new Date();
      } catch (refundError) {
        if (refundError.code === 'charge_already_refunded') {
          console.warn("Stripe sync: Charge already refunded on Stripe end. Sycronizing local database.");
          order.paymentStatus = "Refunded";
          order.refundStatus = "Completed";
          order.refundDate = new Date();
        } else {
          console.error("Stripe Auto-Refund Error:", refundError);
          return res.status(400).json({ 
            message: "Order cancellation halted: Automatic refund failed. " + refundError.message 
          });
        }
      }
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled and refunded successfully", order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

/* ================= REQUEST RETURN (USER) ================= */
router.post("/:id/return", protect, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim() === "") {
        return res.status(400).json({ message: "Return reason is required." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Only delivered orders can be returned." });
    }

    // Fallback securely to updatedAt if deliveredAt wasn't recorded previously
    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt);

    // Check 7-day window
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    if (now - deliveryDate > SEVEN_DAYS_MS) {
       return res.status(400).json({ message: "Return window has expired (7 days from delivery)." });
    }

    if (order.returnRequestStatus !== "None") {
       return res.status(400).json({ message: "A return request has already been placed for this order." });
    }

    order.returnRequestStatus = "Requested";
    order.returnReason = reason.trim();
    
    await order.save();

    res.json({ message: "Return request submitted successfully. Awaiting authorization.", order });
  } catch (error) {
    console.error("Return order error:", error);
    res.status(500).json({ message: "Failed to submit return request" });
  }
});

module.exports = router;