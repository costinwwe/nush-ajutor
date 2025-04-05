// src/config/api.js
import axios from 'axios';

// Base API URL
export const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: `${API_URL}/auth/register`,
    LOGIN: `${API_URL}/auth/login`,
    LOGOUT: `${API_URL}/auth/logout`,
    ME: `${API_URL}/auth/me`,
    UPDATE_DETAILS: `${API_URL}/auth/updatedetails`,
    UPDATE_PASSWORD: `${API_URL}/auth/updatepassword`,
  },
  
  // Products
  PRODUCTS: {
    LIST: `${API_URL}/products`,
    DETAIL: (id) => `${API_URL}/products/${id}`,
    FEATURED: `${API_URL}/products/featured`,
    NEW: `${API_URL}/products/new`,
    SALE: `${API_URL}/products/sale`,
    BESTSELLERS: `${API_URL}/products/bestsellers`,
    REVIEWS: (id) => `${API_URL}/products/${id}/reviews`,
  },
  
  // Categories
  CATEGORIES: {
    LIST: `${API_URL}/categories`,
    DETAIL: (id) => `${API_URL}/categories/${id}`,
  },
  
  // Orders
  ORDERS: {
    CREATE: `${API_URL}/orders`,
    LIST: `${API_URL}/orders`,
    MY_ORDERS: `${API_URL}/orders/myorders`,
    DETAIL: (id) => `${API_URL}/orders/${id}`,
    UPDATE_STATUS: (id) => `${API_URL}/orders/${id}/status`,
    PAY: (id) => `${API_URL}/orders/${id}/pay`,
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: `${API_URL}/admin/dashboard`,
    USERS: `${API_URL}/admin/users`,
    USER_ROLE: (id) => `${API_URL}/admin/users/${id}/role`,
    DELETE_USER: (id) => `${API_URL}/admin/users/${id}`,
    PRODUCT_FEATURED: (id) => `${API_URL}/admin/products/${id}/featured`,
    PRODUCT_NEW: (id) => `${API_URL}/admin/products/${id}/new`,
  },
  
  // Payment
  PAYMENT: {
    CREATE_INTENT: `${API_URL}/payment/create-payment-intent`,
    PAYMENT_SUCCESS: `${API_URL}/payment/payment-success`,
  },
  
  // Upload path for images
  UPLOADS: `${API_URL.replace('/api', '')}/uploads/`
};

// Create a configured axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // For admin routes, try to use adminToken first
    if (config.url.includes('/admin')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        return config;
      }
    }
    
    // For other authenticated routes, use regular token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Check which token caused the issue
      if (error.config.url.includes('/admin')) {
        localStorage.removeItem('adminToken');
        // Redirect to admin login
        if (window.location.pathname.includes('/amCoae')) {
          window.location.href = '/amCoae';
        }
      } else {
        localStorage.removeItem('token');
        // Redirect to regular login
        if (!window.location.pathname.includes('/account')) {
          window.location.href = '/account';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;