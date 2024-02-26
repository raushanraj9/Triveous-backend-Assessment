const express = require('express');

const productController = require('../controllers/productController');
const { authenticateToken } = require('../middlewares/auth_middleware');

// Create an instance of an Express Router
const productRouter = express.Router();

// Get all products
productRouter.get('/', productController.getAllProducts);

// Get product details by product ID
productRouter.get('/:productId/product/details', authenticateToken, productController.getProductDetails);

// Get products by category ID
productRouter.get('/:categoryId/category/details', authenticateToken, productController.getProductsByCategory);

// Add a new product
productRouter.post('/', authenticateToken, productController.addProduct);

// Update product by product ID
productRouter.put('/:productId', authenticateToken, productController.updateProduct);

// Delete product by product ID
productRouter.delete('/:productId', authenticateToken, productController.deleteProduct);

module.exports = productRouter;