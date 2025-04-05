import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get(ENDPOINTS.AUTH.ME);
        
        if (response.data.success) {
          setUser(response.data.data);
          setIsAuthenticated(true);
          setIsAdmin(response.data.data.role === 'admin');
        }
      } catch (err) {
        localStorage.removeItem('token');
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        await loadUserData();
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  // Login user
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        await loadUserData();
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
      setLoading(false);
      return { success: false, error: err.response?.data?.error || 'Invalid credentials' };
    }
  };

  // Load user data after login/register
  const loadUserData = async () => {
    try {
      const response = await api.get(ENDPOINTS.AUTH.ME);
      
      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        setIsAdmin(response.data.data.role === 'admin');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user data');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.get(ENDPOINTS.AUTH.LOGOUT);
      
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if API fails
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  // Update user details
  const updateProfile = async (userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await api.put(ENDPOINTS.AUTH.UPDATE_DETAILS, userData);
      
      if (response.data.success) {
        setUser(response.data.data);
        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setLoading(false);
      return { success: false, error: err.response?.data?.error || 'Failed to update profile' };
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await api.put(ENDPOINTS.AUTH.UPDATE_PASSWORD, passwordData);
      
      if (response.data.success) {
        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
      setLoading(false);
      return { success: false, error: err.response?.data?.error || 'Failed to update password' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;