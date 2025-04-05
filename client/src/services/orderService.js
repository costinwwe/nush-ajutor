// src/services/orderService.js
import api, { ENDPOINTS } from '../config/api';

/**
 * Service for handling orders
 */
const orderService = {
  /**
   * Get all orders for the current user
   */
  getMyOrders: async () => {
    try {
      const response = await api.get(ENDPOINTS.ORDERS.MY_ORDERS);
      return response.data;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  },

  /**
   * Get all orders (admin only)
   */
  getAllOrders: async () => {
    try {
      const response = await api.get(ENDPOINTS.ORDERS.LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  /**
   * Get a specific order by ID
   */
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(ENDPOINTS.ORDERS.DETAIL(orderId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new order
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post(ENDPOINTS.ORDERS.CREATE, orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Update order status (admin only)
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  }
};

export default orderService;