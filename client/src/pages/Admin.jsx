import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { ENDPOINTS } from '../config/api';
import AdminOrderList from '../comps/AdminOrderList';

const Admin = () => {
  const { isAdmin, login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({});
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  
  // Check if already logged in as admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (isAdmin) {
          // If already admin, fetch dashboard data
          await fetchDashboardData();
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };
    
    checkAdmin();
  }, [isAdmin]);
  
  // Fetch orders when orders tab is selected
  useEffect(() => {
    if (activeTab === 'orders' && isAdmin) {
      fetchOrders();
    }
  }, [activeTab, isAdmin]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(ENDPOINTS.ADMIN.DASHBOARD);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      
      const response = await api.get(ENDPOINTS.ORDERS.LIST);
      
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setOrdersError('Failed to load orders');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrdersError('Failed to load orders: ' + (err.response?.data?.error || err.message));
    } finally {
      setOrdersLoading(false);
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Format admin email
      const adminEmail = username.includes('@') ? username : `${username}@berserkarmory.com`;
      
      // Use the regular login function
      const result = await login(adminEmail, password);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }
      
      // Verify admin status manually
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${ENDPOINTS.AUTH.ME}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userData = await response.json();
      
      if (!response.ok || !userData.data || userData.data.role !== 'admin') {
        throw new Error('Not authorized as admin');
      }
      
      // Set the admin token explicitly
      localStorage.setItem('adminToken', token);
      
      // Load dashboard data
      await fetchDashboardData();
      
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Invalid admin credentials');
      // Clear any tokens on failure
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };
  
  // Render login form if not admin
  if (!isAdmin) {
    return (
      <div className="admin-login">
        <h1>Admin Login</h1>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin or admin@berserkarmory.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }
  
  // Admin dashboard content
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
          window.location.reload();
        }}>Logout</button>
      </div>
      
      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <h2>Dashboard Overview</h2>
              
              <div className="admin-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button onClick={() => navigate('/admin/add-product')}>
                    Add New Product
                  </button>
                  <button onClick={() => navigate('/admin/add-category')}>
                    Add New Category
                  </button>
                </div>
              </div>
              
              {Object.keys(dashboardData).length > 0 ? (
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h3>Products</h3>
                    <p>{dashboardData.productCount || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Categories</h3>
                    <p>{dashboardData.categoryCount || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Orders</h3>
                    <p>{dashboardData.orderCount || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Users</h3>
                    <p>{dashboardData.userCount || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Revenue</h3>
                    <p>${dashboardData.revenue?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              ) : (
                <p>No dashboard data available</p>
              )}
            </div>
          )}
          
          {activeTab === 'categories' && (
            <div className="categories-section">
              <div className="section-header">
                <h2>Categories Management</h2>
                <button onClick={() => navigate('/admin/add-category')}>
                  Add New Category
                </button>
              </div>
              <p>Select "Add New Category" to create your first category</p>
            </div>
          )}
          
          {activeTab === 'products' && (
            <div className="products-section">
              <div className="section-header">
                <h2>Products Management</h2>
                <button onClick={() => navigate('/admin/add-product')}>
                  Add New Product
                </button>
              </div>
              <p>Select "Add New Product" to create your first product</p>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Orders Management</h2>
              {ordersError && <div className="error-message">{ordersError}</div>}
              
              {ordersLoading ? (
                <div className="loading">Loading orders...</div>
              ) : (
                <AdminOrderList 
                  orders={orders} 
                  refreshOrders={fetchOrders} 
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;