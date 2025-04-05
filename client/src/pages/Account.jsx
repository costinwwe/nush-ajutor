import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderList from '../comps/OrderList';

const Account = () => {
  const { isAuthenticated, user, login, register, logout, loading, error: authError } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeProfileTab, setActiveProfileTab] = useState('orders');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for redirect parameter in URL
  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      
      if (redirect) {
        navigate(`/${redirect}`);
      }
    }
  }, [isAuthenticated, location, navigate]);

  // Set error from auth context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    const result = await login(loginForm.email, loginForm.password);
    
    if (!result.success && result.error) {
      setError(result.error);
    }
  };
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validate password matching
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    
    const result = await register({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password
    });
    
    if (result.success) {
      setSuccessMessage('Registration successful!');
      setActiveTab('login');
      // Reset registration form
      setRegisterForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } else if (result.error) {
      setError(result.error);
    }
  };
  
  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleLogout = () => {
    logout();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="account-container">
      {!isAuthenticated ? (
        <div className="auth-container">
          <div className="auth-header">
            <h1>MY ACCOUNT</h1>
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                LOGIN
              </button>
              <button 
                className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                REGISTER
              </button>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          {activeTab === 'login' ? (
            <div className="login-form-container">
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required 
                  />
                </div>
                
                <button type="submit" className="auth-button">LOGIN</button>
                
                <div className="auth-links">
                  <a href="#" className="forgot-password" onClick={(e) => {
                    e.preventDefault();
                    alert('This feature is not yet implemented');
                  }}>Forgot Password?</a>
                </div>
              </form>
            </div>
          ) : (
            <div className="register-form-container">
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <input 
                    type="text" 
                    id="reg-name" 
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg-email">Email</label>
                  <input 
                    type="email" 
                    id="reg-email" 
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <input 
                    type="password" 
                    id="reg-password" 
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    required 
                    minLength="6"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg-confirm-password">Confirm Password</label>
                  <input 
                    type="password" 
                    id="reg-confirm-password" 
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    required 
                    minLength="6"
                  />
                </div>
                
                <button type="submit" className="auth-button">CREATE ACCOUNT</button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="profile-container">
          <div className="profile-header">
            <h1>MY ACCOUNT</h1>
            <button onClick={handleLogout} className="logout-button">
              <i className="fas fa-sign-out-alt"></i> LOGOUT
            </button>
          </div>
          
          <div className="profile-content">
            <div className="profile-sidebar">
              <div className="profile-info">
                <h2>PROFILE</h2>
                <div className="user-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-email">{user?.email || 'user@example.com'}</p>
                <p className="join-date">
                  Member since: {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </p>
              </div>
              
              <div className="profile-nav">
                <a 
                  href="#orders"
                  className={`profile-nav-item ${activeProfileTab === 'orders' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveProfileTab('orders');
                  }}
                >
                  <i className="fas fa-box"></i> My Orders
                </a>
                <a 
                  href="#wishlist"
                  className={`profile-nav-item ${activeProfileTab === 'wishlist' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveProfileTab('wishlist');
                  }}
                >
                  <i className="fas fa-heart"></i> Wishlist
                </a>
                <a 
                  href="#address"
                  className={`profile-nav-item ${activeProfileTab === 'address' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveProfileTab('address');
                  }}
                >
                  <i className="fas fa-address-book"></i> Addresses
                </a>
                <a 
                  href="#settings"
                  className={`profile-nav-item ${activeProfileTab === 'settings' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveProfileTab('settings');
                  }}
                >
                  <i className="fas fa-cog"></i> Settings
                </a>
              </div>
            </div>
            
            <div className="profile-main">
              {activeProfileTab === 'orders' && (
                <OrderList />
              )}
              
              {activeProfileTab === 'wishlist' && (
                <div className="wishlist-section">
                  <h2>MY WISHLIST</h2>
                  <p>Wishlist feature coming soon!</p>
                </div>
              )}
              
              {activeProfileTab === 'address' && (
                <div className="address-section">
                  <h2>MY ADDRESSES</h2>
                  <p>Address management feature coming soon!</p>
                </div>
              )}
              
              {activeProfileTab === 'settings' && (
                <div className="settings-section">
                  <h2>ACCOUNT SETTINGS</h2>
                  <p>Account settings feature coming soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;