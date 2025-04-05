const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  setProductFeatured,
  setProductNew
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Product management
router.put('/products/:id/featured', setProductFeatured);
router.put('/products/:id/new', setProductNew);

module.exports = router; 