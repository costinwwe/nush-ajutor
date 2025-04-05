import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getMyOrders();
        
        if (response.success) {
          setOrders(response.data);
        } else {
          setError('Could not fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'delivered';
      case 'shipped':
        return 'shipped';
      case 'processing':
        return 'processing';
      case 'cancelled':
        return 'cancelled';
      case 'pending':
      default:
        return 'pending';
    }
  };

  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="orders-section">
      <h2>MY ORDERS</h2>
      
      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span>Order ID:</span> #{order._id.substring(0, 8)}
                </div>
                <div className="order-date">
                  <span>Date:</span> {formatDate(order.createdAt)}
                </div>
              </div>
              <div className="order-details">
                <div className="order-status">
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="order-total">
                  <span>Total:</span> ${order.totalPrice.toFixed(2)}
                </div>
              </div>
              <div className="order-actions">
                <Link to={`/order/${order._id}`} className="view-details-btn">View Details</Link>
                {order.status === 'delivered' && (
                  <button className="write-review-btn">Write Review</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <Link to="/shop" className="shop-now-btn">SHOP NOW</Link>
        </div>
      )}
    </div>
  );
};

export default OrderList;