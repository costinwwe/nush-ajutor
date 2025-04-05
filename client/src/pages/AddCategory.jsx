import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { ENDPOINTS } from '../config/api';

const AddCategory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Check admin status
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/amCoae');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
      // Create form data for multipart/form-data
      const categoryFormData = new FormData();
      categoryFormData.append('name', formData.name);
      categoryFormData.append('description', formData.description);
      
      if (image) {
        categoryFormData.append('image', image);
      }
      
      // Get the current token manually to ensure it's included
      const token = localStorage.getItem('token');
      
      // Make the API request with proper headers
      const response = await fetch(ENDPOINTS.CATEGORIES.LIST, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: categoryFormData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category');
      }
      
      setSuccess(true);
      setFormData({ name: '', description: '' });
      setImage(null);
      setPreview('');
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/amCoae');
      }, 2000);
      
    } catch (err) {
      console.error('Category creation error:', err);
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-add-category">
      <div className="admin-header">
        <h1>Add New Category</h1>
        <button onClick={() => navigate('/amCoae')}>Back to Admin</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Category added successfully!</div>}
      
      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label>Category Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description *</label>
          <textarea
            rows="4"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Category Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview && (
            <div className="image-preview">
              <img
                src={preview}
                alt="Category preview"
                style={{ maxWidth: '200px', marginTop: '10px' }}
              />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/amCoae')}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;