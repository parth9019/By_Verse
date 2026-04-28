// routes/admin/product.js
const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../../middleware/authMiddleware');
const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
} = require('../../controllers/admin/productController');

// ✅ CREATE PRODUCT
router.post('/', protect, adminOnly, createProduct);

// ✅ GET ALL PRODUCTS
router.get('/', protect, adminOnly, getAllProducts);

// ✅ UPDATE PRODUCT
router.put('/:id', protect, adminOnly, updateProduct);

// ✅ DELETE PRODUCT
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
