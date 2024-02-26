const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  availability: Boolean,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
});

module.exports.productModel = mongoose.model('Product', productSchema);