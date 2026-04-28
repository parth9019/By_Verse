const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require('../../controllers/admin/categoryController');

const { protect, adminOnly } = require('../../middleware/authMiddleware');

router.post('/', protect, adminOnly, createCategory);
router.get('/', protect, adminOnly, getCategories);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
