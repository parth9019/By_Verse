const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Ensure a subcategory name is unique within a specific category
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('SubCategory', subCategorySchema);
