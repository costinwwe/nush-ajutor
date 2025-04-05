import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Collections = () => {
  const { collectionType } = useParams();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        
        // Fetch all collections in parallel
        const [featuredRes, newRes, saleRes, bestRes] = await Promise.all([
          axios.get(`${API_URL}/products/featured`),
          axios.get(`${API_URL}/products/new`),
          axios.get(`${API_URL}/products/sale`),
          axios.get(`${API_URL}/products/bestsellers`)
        ]);
        
        setFeaturedProducts(featuredRes.data.data);
        setNewArrivals(newRes.data.data);
        setSaleProducts(saleRes.data.data);
        setBestsellers(bestRes.data.data);
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load collections');
        setLoading(false);
      }
    };
    
    fetchCollections();
  }, []);
  
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
  
  if (loading) {
    return <div className="loading">Loading collections...</div>;
  }

  return (
    <div className="collections-container">
      <div className="collections-header">
        <h1>COLLECTIONS</h1>
        <p>Curated sets of premium merchandise and collectibles</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="collection-grid">
        <div className="collection-card">
          {featuredProducts.length > 0 && (
            <div className="collection-image">
              <img 
                src={`${API_URL}/uploads/${featuredProducts[0].images[0]}`}
                alt="Featured Collection"
              />
            </div>
          )}
          <div className="collection-info">
            <h2>FEATURED ITEMS</h2>
            <p>Our most popular merchandise</p>
            <Link to="/collections/featured" className="view-collection">VIEW COLLECTION</Link>
          </div>
        </div>
        
        <div className="collection-card">
          {saleProducts.length > 0 && (
            <div className="collection-image">
              <img 
                src={`${API_URL}/uploads/${saleProducts[0].images[0]}`}
                alt="Sale Collection" 
              />
            </div>
          )}
          <div className="collection-info">
            <h2>ON SALE</h2>
            <p>Special discounts on premium items</p>
            <Link to="/collections/sale" className="view-collection">VIEW COLLECTION</Link>
          </div>
        </div>
        
        <div className="collection-card">
          {bestsellers.length > 0 && (
            <div className="collection-image">
              <img 
                src={`${API_URL}/uploads/${bestsellers[0].images[0]}`}
                alt="Bestsellers Collection"
              />
            </div>
          )}
          <div className="collection-info">
            <h2>BESTSELLERS</h2>
            <p>Our most popular items</p>
            <Link to="/collections/bestsellers" className="view-collection">VIEW COLLECTION</Link>
          </div>
        </div>
        
        <div className="collection-card new-collection">
          {newArrivals.length > 0 && (
            <div className="collection-image">
              <img 
                src={`${API_URL}/uploads/${newArrivals[0].images[0]}`}
                alt="New Arrivals Collection"
              />
            </div>
          )}
          <div className="collection-info">
            <h2>NEW ARRIVALS</h2>
            <p>Fresh additions to our catalog</p>
            <Link to="/collections/new" className="view-collection">VIEW COLLECTION</Link>
          </div>
        </div>
      </div>
      
      {collectionType && (
        <div className="collection-products">
          <h2>
            {collectionType === 'featured' && 'FEATURED ITEMS'}
            {collectionType === 'new' && 'NEW ARRIVALS'}
            {collectionType === 'sale' && 'ON SALE'}
            {collectionType === 'bestsellers' && 'BESTSELLERS'}
          </h2>
          
          <div className="products-grid">
            {(collectionType === 'featured' ? featuredProducts :
              collectionType === 'new' ? newArrivals :
              collectionType === 'sale' ? saleProducts :
              bestsellers).map(product => (
                <div className="product-card" key={product._id}>
                  <Link to={`/product/${product._id}`}>
                    <div className="product-image">
                      <img 
                        src={`${API_URL}/uploads/${product.images[0]}`}
                        alt={product.name}
                      />
                      {product.isNew && <span className="new-badge">NEW</span>}
                      {product.discount > 0 && (
                        <span className="discount-badge">-{product.discount}%</span>
                      )}
                    </div>
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
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections; 