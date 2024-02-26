// Nodemailer Location
const { sendEmail } = require('../helpers/sendingEmails');

// Models Location
const { userModel } = require('../models/userModel');
const { orderModel } = require('../models/orderModel');
const { cartModel } = require('../models/cartModel');

const colors = require('colors');

// Place an order
exports.placeOrder = async (req, res) => {
    try {
      const userId = req.userId; // Get the user ID from the authenticated token
  
      // Find the user's cart
      const userCart = await cartModel.findOne({ user: userId }).populate('items.product');
  
      if (!userCart || userCart.items.length === 0) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: 'Cannot place an empty order. Add items to your cart first.',
        });
      }
  
      // Calculate the order total
      const orderTotal = userCart.items.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);
  
      // Fetch user data, including email
      const userData = await userModel.findById(userId); // Assuming you have a userModel for storing user data
  
      // Create a new order
      const order = new orderModel({
        user: userId,
        items: userCart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        total: orderTotal,
      });
  
      // Save the order to the database
      await order.save();
  
      // Clear the user's cart
      userCart.items = [];
      await userCart.save();
  
      // Send an order confirmation email
      const emailData = {
        email: userData.email,
        subject: 'Order Confirmation - Triveous Ecommerce',
        body: `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <h2>Order Confirmation</h2>
              <p>Dear ${userData.name},</p>
              <p>Your order has been successfully placed with Triveous Ecommerce. Below are the order details:</p>
              <ul>
                <!-- Include order details here, such as order ID, products, total amount, etc. -->
              </ul>
              <p>Thank you for shopping with us!</p>
              <p>Best regards,</p>
              <p>The Triveous Ecommerce Team</p>
            </body>
          </html>
        `,
      };
  
      // Send the order confirmation email
      sendEmail(emailData);
  
      return res.status(201).json({
        status: 201,
        success: true,
        message: 'Order placed successfully',
        data: order,
      });
    } catch (error) {
      console.error(colors.red('Error in placeOrder: ', error.message));
      res.status(500).json({
        status: 500,
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      });
    }
};
  
// Get order history for an authenticated user
exports.getOrderHistory = async (req, res) => {
  try {
    const userId = req.userId; // Get the user ID from the authenticated token

    // Find all orders for the user
    const orders = await orderModel.find({ user: userId }).populate('items.product');

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Order history retrieved successfully',
      data: orders,
    });
  } catch (error) {
    console.error(colors.red('Error in getOrderHistory: ', error.message));
    res.status(500).json({
      status: 500,
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

// Get order details by order ID
exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Find the order by its ID
    const order = await orderModel.findById(orderId).populate('items.product');

    if (!order) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Order details retrieved successfully',
      data: order,
    });
  } catch (error) {
    console.error(colors.red('Error in getOrderDetails: ', error.message));
    res.status(500).json({
      status: 500,
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

// Update the order status by order ID
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    // Find the order by its ID
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Order not found',
      });
    }

    // Update the order status
    order.status = status;
    await order.save();

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error(colors.red('Error in updateOrderStatus: ', error.message));
    res.status(500).json({
      status: 500,
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};