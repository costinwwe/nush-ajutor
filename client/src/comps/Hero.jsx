import React from 'react';
import { Link } from 'react-router-dom';
import { bgVideo } from '../assets/assets.js';

const Hero = () => {
  return (
    <div className="hero-container">
      <video autoPlay loop muted className="background-video">
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="hero-content">
        <h1 className="hero-title">BERSERK ARMORY</h1>
        <p className="hero-subtitle">Premium merchandise for true fans</p>
        
        <div className="hero-cta">
          <Link to="/shop" className="shop-button">
            EXPLORE SHOP
          </Link>
          <Link to="/collections/new" className="secondary-button">
            NEW ARRIVALS
          </Link>
        </div>
      </div>
      
      <div className="hero-feature">
        <div className="feature-item">
          <h3>APPAREL</h3>
          <p>Premium T-shirts and hoodies with unique designs</p>
        </div>
        <div className="feature-item">
          <h3>ACCESSORIES</h3>
          <p>Necklaces and pendants inspired by Berserk</p>
        </div>
        <div className="feature-item">
          <h3>COLLECTIBLES</h3>
          <p>Limited edition posters and artwork</p>
        </div>
      </div>
    </div>
  );
};

export default Hero;