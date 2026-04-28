const Product = require('../../models/Product');
const Category = require('../../models/Category');

/* ================= CREATE PRODUCT ================= */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'All required fields missing' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET ALL PRODUCTS (ADMIN) ================= */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= UPDATE PRODUCT ================= */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
