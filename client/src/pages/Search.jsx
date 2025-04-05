import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const Search = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const API_URL = 'http://localhost:5000/api';
  
  // Extract search query from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
    
    // Load categories
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/categories`);
        setCategories(data.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    
    fetchCategories();
  }, [location.search]);
  
  const performSearch = async (query, category = selectedCategory, price = priceRange) => {
    if (!query.trim() && !category && !price.min && !price.max) {
      setSearchResults([]);
      setHasSearched(true);
      return;
    }
    
    try {
      setLoading(true);
      setHasSearched(true);
      
      // Build query parameters
      let params = {};
      
      if (query.trim()) {
        params.keyword = query.trim();
      }
      
      if (category) {
        params.category = category;
      }
      
      if (price.min) {
        params.minPrice = price.min;
      }
      
      if (price.max) {
        params.maxPrice = price.max;
      }
      
      const { data } = await axios.get(`${API_URL}/products`, { params });
      setSearchResults(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
    
    // Update URL with search query for bookmarking/sharing
    const searchParams = new URLSearchParams();
    if (searchQuery.trim()) {
      searchParams.set('q', searchQuery);
    }
    
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  const handlePriceChange = (e, bound) => {
    setPriceRange({
      ...priceRange,
      [bound]: e.target.value
    });
  };
  
  const applyFilters = () => {
    performSearch(searchQuery);
  };
  
  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    
    // Reset URL
    window.history.pushState({}, '', window.location.pathname);
  };
  
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.product === product._id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product exists
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add new product to cart
      cart.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0]
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show confirmation
    alert('Product added to cart!');
  };
  
  return (
    <div className="search-container">
      <div className="search-header">
        <h1>SEARCH</h1>
        <p>Find premium merchandise and collectibles</p>
      </div>
      
      <div className="search-content">
        <div className="search-filters">
          <h3>Filters</h3>
          
          <div className="filter-section">
            <h4>Categories</h4>
            <select 
              value={selectedCategory} 
              onChange={handleCategoryChange}
              className="category-filter"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => handlePriceChange(e, 'min')}
                min="0"
                className="price-input"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => handlePriceChange(e, 'max')}
                min="0"
                className="price-input"
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button onClick={applyFilters} className="apply-filters">Apply Filters</button>
            <button onClick={clearFilters} className="clear-filters">Clear All</button>
          </div>
        </div>
        
        <div className="search-main">
          <div className="search-form-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for t-shirts, necklaces, hoodies, posters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <i className="fas fa-search"></i> SEARCH
              </button>
            </form>
          </div>
          
          <div className="search-results">
            {loading ? (
              <div className="loading">Searching...</div>
            ) : hasSearched ? (
              <>
                {searchResults.length > 0 ? (
                  <>
                    <h2>SEARCH RESULTS</h2>
                    <div className="results-count">{searchResults.length} items found</div>
                    <div className="results-grid">
                      {searchResults.map(product => (
                        <div key={product._id} className="product-card">
                          <Link to={`/product/${product._id}`}>
                            <div className="product-image">
                              {product.images && product.images.length > 0 && (
                                <img 
                                  src={`${API_URL}/uploads/${product.images[0]}`}
                                  alt={product.name}
                                />
                              )}
                              {product.isNew && <span className="new-badge">NEW</span>}
                              {product.discount > 0 && (
                                <span className="discount-badge">-{product.discount}%</span>
                              )}
                            </div>
                            <div className="product-details">
                              <h3>{product.name}</h3>
                              <p className="product-category">
                                {product.category?.name || 'Uncategorized'}
                              </p>
                              <div className="product-price">
                                {product.discount > 0 ? (
                                  <>
                                    <span className="original-price">${product.price.toFixed(2)}</span>
                                    <span className="discount-price">
                                      ${(product.price - (product.price * product.discount / 100)).toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span>${product.price.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                          <button 
                            className="add-to-cart-btn"
                            onClick={() => addToCart(product)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-results">
                    <i className="fas fa-exclamation-circle"></i>
                    <h3>No items found</h3>
                    <p>Try different keywords or browse our categories</p>
                    <Link to="/shop" className="browse-shop-btn">Browse Shop</Link>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 