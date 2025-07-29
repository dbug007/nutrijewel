import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { featuredTopSellers } from '../data/products';
import './TopSellers.css';

const TopSellers = () => {
  const handleWhatsApp = (productName) => {
    const message = `Hi! I'm interested in ordering ${productName}. Can you provide more details?`;
    window.open(`https://wa.me/919960637656?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="products" className="top-sellers-section">
      <div className="top-sellers-container">
        {/* Section Header */}
        <div className="top-sellers-header">
          <h2 className="top-sellers-title">
            Our Top Sellers
          </h2>
          <p className="top-sellers-subtitle">
            Discover our most loved products - handcrafted with premium ingredients and packed with nutrition
          </p>
          <div className="top-sellers-divider"></div>
        </div>

        {/* Products Grid */}
        <div className="top-sellers-grid">
          {featuredTopSellers.map((product) => (
            <div 
              key={product.id} 
              className="product-card"
            >
              {/* Product Image */}
              <div className="product-image-container">
                <div className="product-image">
                  <img 
                    src={product.image} 
                    alt={product.displayName}
                    className="product-image-img"
                  />
                </div>
                
                {/* Bestseller Badge */}
                <div className="bestseller-badge">
                  <Star size={12} fill="currentColor" className="bestseller-icon" />
                  <span>Bestseller</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="product-info">
                <div className="product-header">
                  <h3>
                    {product.displayName}
                  </h3>
                  <p className="product-category">{product.category}</p>
                </div>

                <p className="product-description">
                  {product.description}
                </p>

                {/* Features */}
                <div className="product-features">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <span 
                      key={index}
                      className="product-feature-tag"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Price and Actions */}
                <div className="product-footer">
                  <div className="product-price-container">
                    <span className="product-price">₹{product.price}</span>
                    <span className="product-weight">({product.weight})</span>
                  </div>
                  
                  <div className="product-actions">
                    <button className="product-favorite-btn">
                      <Heart size={18} />
                    </button>
                    <button 
                      onClick={() => handleWhatsApp(product.displayName)}
                      className="product-order-btn"
                    >
                      <ShoppingCart size={16} className="product-order-icon" />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="view-all-container">
          <button 
            onClick={() => handleWhatsApp('all products catalog')}
            className="view-all-btn"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;
