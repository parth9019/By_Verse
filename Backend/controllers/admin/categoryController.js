const Category = require('../../models/Category');

/* ================= CREATE CATEGORY ================= */
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET ALL CATEGORIES ================= */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= UPDATE CATEGORY ================= */
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    await category.save();

    res.json({
      message: 'Category updated',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= DELETE CATEGORY ================= */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();

    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
