const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "SELLER_APPROVED",
        "SELLER_REJECTED",
        "SELLER_DELETED",
        "CATEGORY_CREATED",
        "CATEGORY_DELETED",
        "PRODUCT_DELETED",
        "ORDER_STATUS_UPDATED",
        "USER_LOGIN",
        "USER_LOGOUT",
        "ADMIN_LOGIN",
        "ADMIN_LOGOUT",
        "SELLER_LOGIN",
        "SELLER_LOGOUT",
        "SELLER_REGISTER",
        "COUPON_CREATED",
        "COUPON_DELETED",
        "SUBCATEGORY_DELETED",
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: {
      type: String, // String representation of what was affected (e.g. "Order #12345")
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
