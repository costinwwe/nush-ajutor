import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { ENDPOINTS } from '../config/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    stock: '',
    category: '',
    featured: false,
    isNew: true
  });
  const [images, setImages] = useState([]);
  const [specifications, setSpecifications] = useState([{ name: '', value: '' }]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get(ENDPOINTS.CATEGORIES.LIST);
        
        if (response.data.success) {
          const categoriesData = response.data.data;
          setCategories(categoriesData);
          
          // Set default category if categories exist
          if (categoriesData.length > 0) {
            setFormData(prevData => ({
              ...prevData,
              category: categoriesData[0]._id
            }));
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load categories. Please try again.');
        console.error('Error fetching categories:', err);
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle image changes
  const handleImageChange = (e) => {
    if (e.target.files) {
      if (e.target.files.length < 3) {
        setError('Please select at least 3 images');
        return;
      }
      
      if (e.target.files.length > 6) {
        setError('Maximum 6 images allowed');
        return;
      }
      
      setImages(Array.from(e.target.files));
      setError('');
    }
  };

  // Handle specification changes
  const handleSpecChange = (index, field, value) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index][field] = value;
    setSpecifications(updatedSpecs);
  };

  // Add a new specification field
  const addSpecification = () => {
    setSpecifications([...specifications, { name: '', value: '' }]);
  };

  // Remove a specification field
  const removeSpecification = (index) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length < 3) {
      setError('Please select at least 3 images');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create form data for file upload
      const productFormData = new FormData();
      
      // Add text fields
      for (const key in formData) {
        productFormData.append(key, formData[key]);
      }
      
      // Add specifications
      const filteredSpecs = specifications.filter(
        spec => spec.name.trim() !== '' && spec.value.trim() !== ''
      );
      productFormData.append('specifications', JSON.stringify(filteredSpecs));
      
      // Add images
      images.forEach(image => {
        productFormData.append('images', image);
      });
      
      // Create product
      const response = await api.post(
        ENDPOINTS.PRODUCTS.LIST,
        productFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setSuccess(true);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          discount: '0',
          stock: '',
          category: categories.length > 0 ? categories[0]._id : '',
          featured: false,
          isNew: true
        });
        setImages([]);
        setSpecifications([{ name: '', value: '' }]);
        
        // Scroll to top to show success message
        window.scrollTo(0, 0);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create product';
      setError(errorMessage);
      console.error('Error creating product:', err);
      
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-add-product">
      <div className="admin-header">
        <h1>Add New Product</h1>
        <button onClick={() => navigate('/amCoae')}>Back to Admin</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Product added successfully!</div>}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="discount">Discount (%)</label>
            <input
              type="number"
              id="discount"
              name="discount"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="stock">Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="images">Product Images (Min 3, Max 6) *</label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            required={images.length === 0}
          />
          <small>Select 3-6 product images</small>
          
          {images.length > 0 && (
            <div className="image-preview">
              {Array.from(images).map((image, index) => (
                <div key={index} className="preview-item">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              Featured Product
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={handleChange}
              />
              New Arrival
            </label>
          </div>
        </div>
        
        <div className="form-group specifications">
          <label>Specifications</label>
          {specifications.map((spec, index) => (
            <div key={index} className="spec-row">
              <input
                type="text"
                placeholder="Name"
                value={spec.name}
                onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpecification}
            className="add-spec-btn"
          >
            Add Specification
          </button>
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
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;