const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingleImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), uploadSingleImage, createCategory);

router.route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin'), uploadSingleImage, updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router; 