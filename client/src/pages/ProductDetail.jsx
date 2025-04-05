import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { ENDPOINTS } from '../config/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(ENDPOINTS.PRODUCTS.DETAIL(id));
        
        if (response.data.success) {
          setProduct(response.data.data);
        }
      } catch (err) {
        setError('Failed to load product. Please try again.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      setQuantity(1);
    } else if (product && newQuantity > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      const success = addToCart(product._id, quantity);
      
      if (success) {
        // Show success message and/or redirect
        navigate('/cart');
      }
    }
  };
  
  const handleReviewChange = (e) => {
    setReviewForm({
      ...reviewForm,
      [e.target.name]: e.target.name === 'rating' ? parseInt(e.target.value) : e.target.value
    });
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate(`/account?redirect=product/${id}`);
      return;
    }
    
    try {
      setReviewLoading(true);
      setReviewError('');
      
      const response = await api.post(
        ENDPOINTS.PRODUCTS.REVIEWS(id),
        reviewForm
      );
      
      if (response.data.success) {
        setReviewSuccess(true);
        setReviewForm({ rating: 5, review: '' });
        
        // Refresh product to show the new review
        const productResponse = await api.get(ENDPOINTS.PRODUCTS.DETAIL(id));
        if (productResponse.data.success) {
          setProduct(productResponse.data.data);
        }
      }
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!product) {
    return <div className="not-found">Product not found</div>;
  }
  
  // Calculate final price with discount
  const finalPrice = product.discount > 0
    ? product.price - (product.price * product.discount / 100)
    : product.price;
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Check if user has already reviewed this product
  const hasUserReviewed = user && product.ratings.some(
    rating => rating.user && rating.user._id === user._id
  );
  
  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <div className="product-images">
          <div className="main-image">
            <img 
              src={`${ENDPOINTS.UPLOADS}${product.images[activeImage]}`} 
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg'; // Fallback image
              }}
            />
            {product.isNew && <span className="new-badge">NEW</span>}
            {product.discount > 0 && (
              <span className="discount-badge">-{product.discount}%</span>
            )}
          </div>
          
          <div className="image-gallery">
            {product.images.map((image, index) => (
              <div 
                key={index} 
                className={`gallery-item ${activeImage === index ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
              >
                <img 
                  src={`${ENDPOINTS.UPLOADS}${image}`} 
                  alt={`${product.name} - View ${index + 1}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            <div className="product-category">
              Category: <span>{product.category?.name || 'Uncategorized'}</span>
            </div>
            <div className="product-rating">
              Rating: <span>{product.averageRating?.toFixed(1) || '0.0'}/5</span> ({product.numReviews} reviews)
            </div>
          </div>
          
          <div className="product-price">
            {product.discount > 0 ? (
              <>
                <span className="original-price">${product.price.toFixed(2)}</span>
                <span className="final-price">${finalPrice.toFixed(2)}</span>
                <span className="discount">Save {product.discount}%</span>
              </>
            ) : (
              <span className="price">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          {product.specifications && product.specifications.length > 0 && (
            <div className="product-specifications">
              <h3>Specifications</h3>
              <ul>
                {product.specifications.map((spec, index) => (
                  <li key={index}>
                    <strong>{spec.name}:</strong> {spec.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="product-actions">
            <div className="quantity-control">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="number" 
                min="1" 
                max={product.stock} 
                value={quantity} 
                onChange={handleQuantityChange}
              />
              <button 
                onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
          
          <div className="stock-status">
            <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
              {product.stock > 0 
                ? `In Stock (${product.stock} available)` 
                : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="product-reviews">
        <h2>Customer Reviews</h2>
        
        {reviewError && <div className="error-message">{reviewError}</div>}
        {reviewSuccess && <div className="success-message">Review submitted successfully!</div>}
        
        {(!hasUserReviewed && product.stock > 0) && (
          <div className="write-review">
            <h3>Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Rating</label>
                <select 
                  name="rating"
                  value={reviewForm.rating} 
                  onChange={handleReviewChange}
                  required
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Review</label>
                <textarea 
                  name="review"
                  rows="5"
                  value={reviewForm.review}
                  onChange={handleReviewChange}
                  required
                  placeholder="Share your thoughts on this product..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="submit-review"
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
        
        <div className="reviews-list">
          {product.ratings && product.ratings.length > 0 ? (
            product.ratings.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <span className="reviewer-name">{review.user?.name || 'Customer'}</span>
                  <span className="review-rating">{review.rating}/5</span>
                  <span className="review-date">
                    {formatDate(review.date)}
                  </span>
                </div>
                <div className="review-content">{review.review}</div>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;