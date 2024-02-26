const { categoryModel } = require("../models/categoryModel");
const { productModel } = require("../models/productModel");
const colors = require("colors");

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    // Fetch all products
    const data = await productModel.find();

    // Respond with a 200 status if successful
    return res.status(200).json({
      status: 200,
      success: true,
      message: "All products retrieved successfully",
      data: data,
    });
  } catch (error) {
    // Log the error and respond with a 500 status for server errors
    console.error(colors.red("Error in getAllProducts: ", error.message));
    res.status(500).json({
      status: 500,
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// Get product details by ID
exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the product by ID
    const singleProductDetails = await productModel.findOne({ _id: productId });

    if (!singleProductDetails) {
      // Respond with a 404 status if the product is not found
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Product not found or Invalid Product ID",
      });
    }

    // Respond with a 200 status if successful
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Product details retrieved successfully",
      data: singleProductDetails,
    });
  } catch (error) {
    // Log the error and respond with a 500 status for server errors
    console.error(colors.red("Error in getProductDetails: ", error.message));
    res.status(500).json({
      status: 500,
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// Get products by category ID
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find products by category ID and populate category details
    const categorizedProducts = await productModel
      .find({ category: categoryId })
      .populate("category");

    if (!categorizedProducts.length) {
      // Respond with a 404 status if no products are found
      return res.status(404).json({
        status: 404,
        success: false,
        message: "No products found for this category",
      });
    }

    // Respond with a 200 status if successful
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Products retrieved successfully by Category ID",
      data: categorizedProducts,
    });
  } catch (error) {
    // Log the error and respond with a 500 status for server errors
    console.error(
      colors.red("Error in getProductsByCategory: ", error.message)
    );
    res.status(500).json({
      status: 500,
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { title, price, description, availability, categoryId } = req.body;
    
    // Check if the specified category exists
    const category = await categoryModel.findById(categoryId);

    if (!category) {
      // Respond with a 404 status if the category is not found
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Category not found",
      });
    }

    // Create a new product and save it
    const product = new productModel({
      title,
      price,
      description,
      availability,
      category: categoryId,
    });
    await product.save();

    // Respond with a 201 status if the product is successfully added
    return res.status(201).json({
      status: 201,
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    // Log the error and respond with a 500 status for server errors
    console.error(colors.red("Error in addProduct: ", error.message));
    res.status(500).json({
      status: 500,
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// Update an existing product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, price, description, availability } = req.body;

    // Check if the product with the provided productId exists
    const product = await productModel.findByIdAndUpdate(
      productId,
      {
        $set: {
          title: title,
          price: price,
          description: description,
          availability: availability,
        },
      },
      { new: true }
    );

    if (!product) {
      // Respond with a 404 status if the product is not found
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Product not found",
      });
    }

    // Respond with a 200 status if the product is successfully updated
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    // Log the error and respond with a 500 status for server errors
    console.error(colors.red("Error in updateProduct: ", error.message));
    res.status(500).json({
      status: 500,
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// Delete an existing product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if the product with the provided productId exists
    const product = await productModel.findById(productId);
    if (!product) {
      // Respond with a 404 status if the product is not found
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Product not found",
      });
    }

    // Delete the product
    await productModel.findByIdAndDelete(productId);

    // Respond with a 204 status (No Content) for a successful deletion
    return res.status(204).send();
  } catch (error) {
    // Log the error and respond with a 500 status for server errors
    console.error(colors.red("Error in deleteProduct: ", error.message));
    res.status(500).json({
      status: 500,
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
