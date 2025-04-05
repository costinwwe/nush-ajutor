import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api, { ENDPOINTS } from '../config/api';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get category from URL params
  const categoryFromUrl = searchParams.get('category');
  
  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoryResponse = await api.get(ENDPOINTS.CATEGORIES.LIST);
        
        if (categoryResponse.data.success) {
          setCategories(categoryResponse.data.data);
        }
        
        // Fetch featured products
        const featuredResponse = await api.get(ENDPOINTS.PRODUCTS.FEATURED);
        
        if (featuredResponse.data.success) {
          setFeaturedProducts(featuredResponse.data.data);
        }
        
        // Fetch products, filtered by category if needed
        const productsUrl = ENDPOINTS.PRODUCTS.LIST;
        const params = {};
        
        if (categoryFromUrl) {
          params.category = categoryFromUrl;
        }
        
        const productsResponse = await api.get(productsUrl, { params });
        
        if (productsResponse.data.success) {
          setProducts(productsResponse.data.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error fetching shop data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categoryFromUrl]);
  
  const handleAddToCart = async (productId) => {
    await addToCart(productId, 1);
  };
  
  if (loading) {
    return <div className="loading">Loading products...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>BERSERK ARMORY SHOP</h1>
        <p>Browse our collection of premium merchandise and collectibles</p>
      </div>
      
      <div className="shop-categories">
        {categories.length > 0 ? (
          categories.map(category => (
            <div className="category-card" key={category._id}>
              <Link to={`/shop?category=${category._id}`}>
                {category.image && (
                  <img 
                    src={`${ENDPOINTS.UPLOADS}${category.image}`}
                    alt={category.name}
                    className="category-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                )}
                <h2>{category.name.toUpperCase()}</h2>
                <p>{category.description}</p>
              </Link>
            </div>
          ))
        ) : (
          <div className="no-categories">
            <p>No categories found</p>
          </div>
        )}
      </div>
      
      {!categoryFromUrl && (
        <div className="featured-products">
          <h2>FEATURED PRODUCTS</h2>
          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <div className="product-card" key={product._id}>
                  <Link to={`/product/${product._id}`}>
                    {product.images && product.images.length > 0 && (
                      <div className="product-image">
                        <img 
                          src={`${ENDPOINTS.UPLOADS}${product.images[0]}`}
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        {product.isNew && <span className="new-badge">NEW</span>}
                        {product.discount > 0 && (
                          <span className="discount-badge">-{product.discount}%</span>
                        )}
                      </div>
                    )}
                    <h3>{product.name}</h3>
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
                  </Link>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>No featured products found</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="all-products">
        <h2>{categoryFromUrl ? 'CATEGORY PRODUCTS' : 'ALL PRODUCTS'}</h2>
        <div className="products-grid">
          {products.length > 0 ? (
            products.map(product => (
              <div className="product-card" key={product._id}>
                <Link to={`/product/${product._id}`}>
                  {product.images && product.images.length > 0 && (
                    <div className="product-image">
                      <img 
                        src={`${ENDPOINTS.UPLOADS}${product.images[0]}`}
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      {product.isNew && <span className="new-badge">NEW</span>}
                      {product.discount > 0 && (
                        <span className="discount-badge">-{product.discount}%</span>
                      )}
                    </div>
                  )}
                  <h3>{product.name}</h3>
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
                </Link>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product._id)}
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            ))
          ) : (
            <div className="no-products">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;