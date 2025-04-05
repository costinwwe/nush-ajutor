const mongoose = require('mongoose');
const slugify = require('mongoose-slug-generator');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    slug: "name"
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be at least 0']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%']
  },
  images: [
    {
      type: String,
      required: true
    }
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  stock: {
    type: Number,
    required: [true, 'Please add the number in stock'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  specifications: [
    {
      name: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  featured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      review: {
        type: String,
        required: true,
        trim: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  averageRating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating when ratings are modified
ProductSchema.pre('save', function(next) {
  if (this.isModified('ratings')) {
    if (this.ratings.length === 0) {
      this.averageRating = 0;
      this.numReviews = 0;
    } else {
      this.averageRating = parseFloat(
        (this.ratings.reduce((sum, item) => sum + item.rating, 0) / this.ratings.length).toFixed(1)
      );
      this.numReviews = this.ratings.length;
    }
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema); 