const Product = require('../models/Product');
const Category = require('../models/Category');
const path = require('path');
const fs = require('fs');
const productUtils = require('../utils/productUtils');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    // Build query
    let query = {};
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by price range
    if (req.query.minPrice && req.query.maxPrice) {
      query.price = { 
        $gte: req.query.minPrice, 
        $lte: req.query.maxPrice 
      };
    } else if (req.query.minPrice) {
      query.price = { $gte: req.query.minPrice };
    } else if (req.query.maxPrice) {
      query.price = { $lte: req.query.maxPrice };
    }
    
    // Filter by featured
    if (req.query.featured) {
      query.featured = req.query.featured === 'true';
    }
    
    // Filter by new
    if (req.query.isNew) {
      query.isNew = req.query.isNew === 'true';
    }
    
    // Search by name
    if (req.query.keyword) {
      query.name = { 
        $regex: req.query.keyword, 
        $options: 'i' 
      };
    }

    const count = await Product.countDocuments(query);
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(req.query.sort || '-createdAt');

    res.status(200).json({
      success: true,
      count,
      pages: Math.ceil(count / pageSize),
      page,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ featured: true })
      .populate('category', 'name')
      .limit(limit)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get new arrival products
// @route   GET /api/products/new
// @access  Public
exports.getNewArrivals = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ isNew: true })
      .populate('category', 'name')
      .limit(limit)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get products on sale (with discount)
// @route   GET /api/products/sale
// @access  Public
exports.getProductsOnSale = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ discount: { $gt: 0 } })
      .populate('category', 'name')
      .limit(limit)
      .sort('-discount');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get bestselling products
// @route   GET /api/products/bestsellers
// @access  Public
exports.getBestsellers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find()
      .populate('category', 'name')
      .limit(limit)
      .sort('-numReviews');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('ratings.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    // Check if category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get images array
    let images = [];
    if (req.files && req.files.length >= 3) {
      images = req.files.map(file => file.filename);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least 3 product images'
      });
    }

    // Process specifications
    let specifications = [];
    if (req.body.specifications) {
      try {
        specifications = JSON.parse(req.body.specifications);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid specifications format'
        });
      }
    }

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      discount: req.body.discount || 0,
      images,
      category: req.body.category,
      stock: req.body.stock || 0,
      specifications,
      featured: req.body.featured === 'true',
      isNew: req.body.isNew === 'true'
    });

    res.status(201).json({
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

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // If category is provided, check if it exists
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
    }

    // Process specifications
    let specifications = product.specifications;
    if (req.body.specifications) {
      try {
        specifications = JSON.parse(req.body.specifications);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid specifications format'
        });
      }
    }

    // Update the product
    const updateData = {
      name: req.body.name || product.name,
      description: req.body.description || product.description,
      price: req.body.price || product.price,
      discount: req.body.discount !== undefined ? req.body.discount : product.discount,
      category: req.body.category || product.category,
      stock: req.body.stock !== undefined ? req.body.stock : product.stock,
      specifications,
      featured: req.body.featured !== undefined ? req.body.featured === 'true' : product.featured,
      isNew: req.body.isNew !== undefined ? req.body.isNew === 'true' : product.isNew
    };

    // Handle image uploads if provided
    if (req.files && req.files.length >= 3) {
      // Delete old images if they exist
      for (const image of product.images) {
        const imagePath = path.join(__dirname, '../uploads', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Add new images
      updateData.images = req.files.map(file => file.filename);
    } else if (req.files && req.files.length > 0 && req.files.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least 3 product images or leave the current ones'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

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

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Delete the image files if they exist
    for (const image of product.images) {
      const imagePath = path.join(__dirname, '../uploads', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.remove();

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

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || !review) {
      return res.status(400).json({
        success: false,
        error: 'Please add a rating and review'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if the user already reviewed this product
    const alreadyReviewed = product.ratings.find(
      r => r.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        error: 'Product already reviewed'
      });
    }

    // Add the new review
    const newReview = {
      user: req.user.id,
      rating: Number(rating),
      review,
      date: Date.now()
    };

    product.ratings.push(newReview);
    
    // Save the product (the pre-save hook will calculate the average rating)
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added',
      data: product.ratings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 