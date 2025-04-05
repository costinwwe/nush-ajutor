const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Count total users
    const userCount = await User.countDocuments();
    
    // Count total products
    const productCount = await Product.countDocuments();
    
    // Count total categories
    const categoryCount = await Category.countDocuments();
    
    // Count total orders and calculate revenue
    const orders = await Order.find();
    const orderCount = orders.length;
    const revenue = orders.reduce((total, order) => total + order.totalPrice, 0);
    
    // Count pending orders
    const pendingOrderCount = await Order.countDocuments({ status: 'pending' });
    
    // Count delivered orders
    const deliveredOrderCount = await Order.countDocuments({ status: 'delivered' });
    
    // Get low stock products (less than 5)
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 } });
    
    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email');
    
    // Top selling products
    const topSellingProducts = await Product.find()
      .sort('-numReviews')
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        userCount,
        productCount,
        categoryCount,
        orderCount,
        revenue,
        pendingOrderCount,
        deliveredOrderCount,
        lowStockProducts,
        recentOrders,
        topSellingProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Manage user roles
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid role'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Don't allow changing the default admin's role
    if (user.email === process.env.ADMIN_USERNAME) {
      return res.status(403).json({
        success: false,
        error: 'Cannot change default admin role'
      });
    }
    
    user.role = role;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Don't allow deleting the default admin
    if (user.email === process.env.ADMIN_USERNAME) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete default admin user'
      });
    }
    
    await user.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Set product as featured
// @route   PUT /api/admin/products/:id/featured
// @access  Private/Admin
exports.setProductFeatured = async (req, res) => {
  try {
    const { featured } = req.body;
    
    if (featured === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide featured status'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    product.featured = featured;
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Set product as new arrival
// @route   PUT /api/admin/products/:id/new
// @access  Private/Admin
exports.setProductNew = async (req, res) => {
  try {
    const { isNew } = req.body;
    
    if (isNew === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide new status'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    product.isNew = isNew;
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 