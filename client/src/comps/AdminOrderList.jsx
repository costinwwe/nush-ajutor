import React, { useState } from 'react';
import api, { ENDPOINTS } from '../config/api';

const AdminOrderList = ({ orders, refreshOrders }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusUpdateId, setStatusUpdateId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'processing':
        return 'status-processing';
      case 'cancelled':
        return 'status-cancelled';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId, status, trackingNum = '') => {
    try {
      setLoading(true);
      setError('');
      
      const updateData = { status };
      if (trackingNum) {
        updateData.trackingNumber = trackingNum;
      }
      
      const response = await api.put(
        ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
        updateData
      );
      
      if (response.data.success) {
        // Reset update form
        setStatusUpdateId(null);
        setSelectedStatus('');
        setTrackingNumber('');
        
        // Refresh orders list
        refreshOrders();
      } else {
        setError('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle status update form
  const toggleStatusUpdate = (orderId, currentStatus) => {
    if (statusUpdateId === orderId) {
      setStatusUpdateId(null);
      setSelectedStatus('');
      setTrackingNumber('');
    } else {
      setStatusUpdateId(orderId);
      setSelectedStatus(currentStatus);
      const order = orders.find(o => o._id === orderId);
      setTrackingNumber(order.trackingNumber || '');
    }
  };

  if (orders.length === 0) {
    return <p>No orders found.</p>;
  }

  return (
    <div className="admin-orders-list">
      {error && <div className="error-message">{error}</div>}
      
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <React.Fragment key={order._id}>
              <tr>
                <td>#{order._id.substring(0, 8)}</td>
                <td>{order.user?.name || 'N/A'}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.orderItems.length} items</td>
                <td>${order.totalPrice.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td>
                  <button 
                    className="view-details-btn"
                    onClick={() => toggleStatusUpdate(order._id, order.status)}
                  >
                    {statusUpdateId === order._id ? 'Cancel' : 'Update Status'}
                  </button>
                </td>
              </tr>
              
              {/* Status update form row */}
              {statusUpdateId === order._id && (
                <tr className="status-update-row">
                  <td colSpan="7">
                    <div className="status-update-form">
                      <div className="form-group">
                        <label>Update Status:</label>
                        <select 
                          value={selectedStatus} 
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="">Select Status</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      
                      {selectedStatus === 'shipped' && (
                        <div className="form-group">
                          <label>Tracking Number:</label>
                          <input 
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter tracking number"
                          />
                        </div>
                      )}
                      
                      <button
                        className="update-status-btn"
                        onClick={() => handleStatusChange(order._id, selectedStatus, trackingNumber)}
                        disabled={loading || !selectedStatus}
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              
              {/* Order details row */}
              <tr className="order-details-row">
                <td colSpan="7">
                  <div className="order-details">
                    <div className="order-items">
                      <h4>Items</h4>
                      <div className="item-list">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="item-name">{item.name}</div>
                            <div className="item-qty">Qty: {item.quantity}</div>
                            <div className="item-price">${item.price.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="shipping-info">
                      <h4>Shipping Address</h4>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                      <p>{order.shippingAddress.country}</p>
                      
                      {order.trackingNumber && (
                        <div className="tracking-info">
                          <h4>Tracking</h4>
                          <p>{order.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="payment-info">
                      <h4>Payment</h4>
                      <p><strong>Method:</strong> {order.paymentMethod}</p>
                      <p><strong>Status:</strong> {order.isPaid ? 'Paid' : 'Not Paid'}</p>
                      {order.isPaid && order.paidAt && (
                        <p><strong>Date:</strong> {formatDate(order.paidAt)}</p>
                      )}
                      
                      <div className="order-summary">
                        <div className="summary-row">
                          <span>Subtotal:</span>
                          <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="summary-row">
                          <span>Tax:</span>
                          <span>${order.taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Shipping:</span>
                          <span>${order.shippingPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Total:</span>
                          <span>${order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderList;