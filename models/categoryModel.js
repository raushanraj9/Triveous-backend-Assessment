const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports.categoryModel = mongoose.model('Category', categorySchema);