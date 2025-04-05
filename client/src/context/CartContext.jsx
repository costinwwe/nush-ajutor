import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../config/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Initialize cart from localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (!savedCart) {
          setCart([]);
          setLoading(false);
          return;
        }

        const parsedCart = JSON.parse(savedCart);
        
        if (parsedCart.length === 0) {
          setCart([]);
          setLoading(false);
          return;
        }

        // Fetch fresh product data for cart items
        const cartWithDetails = await Promise.all(
          parsedCart.map(async (item) => {
            try {
              const response = await api.get(ENDPOINTS.PRODUCTS.DETAIL(item.product));
              const product = response.data.data;
              
              // Calculate current price (with discount)
              const price = product.discount > 0
                ? product.price - (product.price * product.discount / 100)
                : product.price;
                
              return {
                ...item,
                price,
                image: product.images[0],
                stock: product.stock,
                productData: product
              };
            } catch (err) {
              // If product cannot be fetched, skip it
              return null;
            }
          })
        );

        // Filter out null entries (products that couldn't be fetched)
        const validCartItems = cartWithDetails.filter(item => item !== null);
        
        setCart(validCartItems);
        
        // Update localStorage with valid items
        updateLocalStorage(validCartItems);
        
        // Calculate cart totals
        calculateCartTotals(validCartItems);
      } catch (err) {
        setError('Failed to load cart');
        console.error('Cart loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Update localStorage with cart data
  const updateLocalStorage = (cartItems) => {
    localStorage.setItem(
      'cart',
      JSON.stringify(
        cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          name: item.name
        }))
      )
    );
  };

  // Calculate cart totals
  const calculateCartTotals = (cartItems) => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    setCartTotal(total);
    setItemCount(count);
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      setError(null);
      
      // Get fresh product data
      const response = await api.get(ENDPOINTS.PRODUCTS.DETAIL(productId));
      const product = response.data.data;
      
      // Check if product is in stock
      if (product.stock < quantity) {
        setError(`Sorry, only ${product.stock} items available in stock.`);
        return false;
      }
      
      // Calculate price with discount
      const price = product.discount > 0
        ? product.price - (product.price * product.discount / 100)
        : product.price;
      
      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex(item => item.product === productId);
      
      let updatedCart;
      
      if (existingItemIndex !== -1) {
        // If product exists, update quantity
        const newQuantity = cart[existingItemIndex].quantity + quantity;
        
        // Verify stock limit again
        if (product.stock < newQuantity) {
          setError(`Sorry, only ${product.stock} items available in stock.`);
          return false;
        }
        
        updatedCart = cart.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // If product doesn't exist, add to cart
        const newItem = {
          product: productId,
          name: product.name,
          price,
          quantity,
          image: product.images[0],
          stock: product.stock,
          productData: product
        };
        
        updatedCart = [...cart, newItem];
      }
      
      // Update state
      setCart(updatedCart);
      
      // Update localStorage
      updateLocalStorage(updatedCart);
      
      // Recalculate totals
      calculateCartTotals(updatedCart);
      
      return true;
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Add to cart error:', err);
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    try {
      setError(null);
      
      // Find the item
      const item = cart.find(item => item.product === productId);
      
      if (!item) {
        setError('Item not found in cart');
        return false;
      }
      
      // Validate quantity
      if (quantity < 1) {
        setError('Quantity must be at least 1');
        return false;
      }
      
      // Check stock limit
      if (item.stock < quantity) {
        setError(`Sorry, only ${item.stock} items available in stock.`);
        return false;
      }
      
      // Update cart
      const updatedCart = cart.map(item => 
        item.product === productId
          ? { ...item, quantity }
          : item
      );
      
      // Update state
      setCart(updatedCart);
      
      // Update localStorage
      updateLocalStorage(updatedCart);
      
      // Recalculate totals
      calculateCartTotals(updatedCart);
      
      return true;
    } catch (err) {
      setError('Failed to update item quantity');
      console.error('Update quantity error:', err);
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    try {
      // Filter out the item
      const updatedCart = cart.filter(item => item.product !== productId);
      
      // Update state
      setCart(updatedCart);
      
      // Update localStorage
      updateLocalStorage(updatedCart);
      
      // Recalculate totals
      calculateCartTotals(updatedCart);
      
      return true;
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Remove from cart error:', err);
      return false;
    }
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setCartTotal(0);
    setItemCount(0);
    localStorage.removeItem('cart');
  };

  // Calculate checkout costs
  const calculateCheckoutCosts = () => {
    const subtotal = cartTotal;
    const tax = subtotal * 0.1; // 10% tax
    const shipping = 15; // Fixed shipping cost
    const total = subtotal + tax + shipping;
    
    return {
      subtotal,
      tax,
      shipping,
      total
    };
  };

  // Create order
  const createOrder = async (shippingAddress) => {
    try {
      setError(null);
      
      if (cart.length === 0) {
        setError('Your cart is empty');
        return { success: false, error: 'Your cart is empty' };
      }
      
      const { subtotal, tax, shipping, total } = calculateCheckoutCosts();
      
      const orderData = {
        orderItems: cart.map(item => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        shippingAddress,
        paymentMethod: 'credit_card', // Default payment method
        subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total
      };
      
      const response = await api.post(ENDPOINTS.ORDERS.CREATE, orderData);
      
      if (response.data.success) {
        clearCart();
        return { success: true, order: response.data.data };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    cart,
    loading,
    error,
    cartTotal,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    calculateCheckoutCosts,
    createOrder
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;