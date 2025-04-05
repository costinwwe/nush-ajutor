const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getFeaturedProducts,
  getNewArrivals,
  getProductsOnSale,
  getBestsellers
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultipleImages, validateProductImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Special collections
router.get('/featured', getFeaturedProducts);
router.get('/new', getNewArrivals);
router.get('/sale', getProductsOnSale);
router.get('/bestsellers', getBestsellers);

// Regular routes
router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), uploadMultipleImages, validateProductImages, createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), uploadMultipleImages, updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router; 