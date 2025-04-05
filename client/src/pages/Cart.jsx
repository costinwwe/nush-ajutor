import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ENDPOINTS } from '../config/api';

const Cart = () => {
  const { 
    cart, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    createOrder, 
    calculateCheckoutCosts 
  } = useCart();
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [shippingForm, setShippingForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate order costs
  const { subtotal, tax, shipping, total } = calculateCheckoutCosts();
  
  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };
  
  const handleRemoveItem = (productId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      removeFromCart(productId);
    }
  };
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/account?redirect=cart');
      return;
    }
    
    setShowShippingForm(true);
  };
  
  const handleShippingChange = (e) => {
    setShippingForm({
      ...shippingForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsProcessing(true);
    
    try {
      // Basic validation
      for (const field in shippingForm) {
        if (!shippingForm[field]) {
          setFormError(`Please enter your ${field}`);
          setIsProcessing(false);
          return;
        }
      }
      
      // Create order
      const result = await createOrder(shippingForm);
      
      if (result.success) {
        // Redirect to payment page with the order ID
        navigate(`/payment/${result.order._id}`);
      } else {
        setFormError(result.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setFormError('There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading your cart...</div>;
  }
  
  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>YOUR CART</h1>
        <p>{cart.length > 0 ? `${cart.length} items in your cart` : 'Your cart is empty'}</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {formError && <div className="error-message">{formError}</div>}
      
      {cart.length > 0 ? (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.product} className="cart-item">
                <div className="item-image">
                  {item.image && (
                    <img 
                      src={`${ENDPOINTS.UPLOADS}${item.image}`} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg'; // Fallback image
                      }}
                    />
                  )}
                </div>
                
                <div className="item-details">
                  <h3>
                    <Link to={`/product/${item.product}`}>
                      {item.name}
                    </Link>
                  </h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                  
                  {item.productData && item.stock < 10 && (
                    <p className="stock-warning">
                      Only {item.stock} left in stock
                    </p>
                  )}
                </div>
                
                <div className="item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                    disabled={item.stock && item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                
                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <button 
                  className="remove-item"
                  onClick={() => handleRemoveItem(item.product)}
                  aria-label="Remove item"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>ORDER SUMMARY</h2>
            
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            
            <div className="summary-total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            {!showShippingForm ? (
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                PROCEED TO CHECKOUT
              </button>
            ) : (
              <form onSubmit={handlePlaceOrder} className="shipping-form">
                <h3>Shipping Address</h3>
                <div className="form-group">
                  <label htmlFor="street">Street Address</label>
                  <input 
                    type="text" 
                    id="street" 
                    name="street"
                    value={shippingForm.street}
                    onChange={handleShippingChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    name="city"
                    value={shippingForm.city}
                    onChange={handleShippingChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input 
                    type="text" 
                    id="state" 
                    name="state"
                    value={shippingForm.state}
                    onChange={handleShippingChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input 
                    type="text" 
                    id="zipCode" 
                    name="zipCode"
                    value={shippingForm.zipCode}
                    onChange={handleShippingChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input 
                    type="text" 
                    id="country" 
                    name="country"
                    value={shippingForm.country}
                    onChange={handleShippingChange}
                    required 
                  />
                </div>
                
                <div className="payment-method">
                  <h3>Payment Method</h3>
                  <div className="payment-info">
                    <p>
                      <i className="fab fa-stripe"></i> 
                      You'll be redirected to our secure payment page after placing the order.
                    </p>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="place-order-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'PROCESSING...' : 'CONTINUE TO PAYMENT'}
                </button>
              </form>
            )}
            
            <Link to="/shop" className="continue-shopping">
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/shop" className="shop-now-btn">
            START SHOPPING
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;