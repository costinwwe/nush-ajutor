import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    return () => {
      setIsMenuOpen(false);
    };
  }, [navigate]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false); // Close menu after search on mobile
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="brand-text">BERSERK</span>
          <span className="brand-subtext">ARMORY</span>
        </Link>

        <div className="navbar-icons">
          <Link to="/search" className="navbar-icon">
            <i className="fas fa-search"></i>
          </Link>
          <Link to="/account" className="navbar-icon">
            <i className="fas fa-user"></i>
            {isAuthenticated && <span className="icon-indicator"></span>}
          </Link>
          <Link to="/cart" className="navbar-icon cart-icon">
            <i className="fas fa-shopping-cart"></i>
            {itemCount > 0 && (
              <span className="cart-count">{itemCount > 99 ? '99+' : itemCount}</span>
            )}
          </Link>
          
          {isAdmin && (
            <Link to="/amCoae" className="navbar-icon admin-icon">
              <i className="fas fa-cog"></i>
            </Link>
          )}
          
          {isAuthenticated && (
            <button onClick={handleLogout} className="navbar-icon logout-icon">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          )}
          
          <button className="menu-toggle" onClick={toggleMenu}>
            <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
        </div>

        <div className={isMenuOpen ? "navbar-links active" : "navbar-links"}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>HOME</Link>
          <Link to="/shop" className="nav-link" onClick={() => setIsMenuOpen(false)}>SHOP</Link>
          <Link to="/collections" className="nav-link" onClick={() => setIsMenuOpen(false)}>COLLECTIONS</Link>
          <Link to="/lore" className="nav-link" onClick={() => setIsMenuOpen(false)}>LORE</Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>ABOUT</Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>CONTACT</Link>
          
          <form onSubmit={handleSearch} className="navbar-search">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
            <button type="submit" className="navbar-search-btn">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;