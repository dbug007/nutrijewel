import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { featuredTopSellers } from '../data/products';
import WeightSelector from './WeightSelector';
import './TopSellers.css';

const TopSellers = () => {
  const navigate = useNavigate();
  const [selectedVariants, setSelectedVariants] = useState({});

  // Initialize default variants for products that have variants
  React.useEffect(() => {
    const initialVariants = {};
    featuredTopSellers.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        initialVariants[product.id] = product.variants[0];
      }
    });
    setSelectedVariants(initialVariants);
  }, []);

  const handleVariantChange = useCallback((productId, variant) => {
    console.log('TopSellers: Variant change for product', productId, ':', variant);
    setSelectedVariants(prev => {
      const newState = {
        ...prev,
        [productId]: variant
      };
      console.log('TopSellers: New selectedVariants state:', newState);
      return newState;
    });
  }, []);

  const getProductPrice = (product) => {
    const selectedVariant = selectedVariants[product.id];
    console.log(`Getting price for ${product.id}:`, selectedVariant ? selectedVariant.price : product.price);
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product.price;
  };

  const getProductOriginalPrice = (product) => {
    const selectedVariant = selectedVariants[product.id];
    if (selectedVariant) {
      return selectedVariant.originalPrice;
    }
    return product.originalPrice;
  };

  const getProductWeight = (product) => {
    const selectedVariant = selectedVariants[product.id];
    if (selectedVariant) {
      return selectedVariant.weight;
    }
    return product.weight;
  };

  const handleWhatsApp = (product) => {
    const selectedVariant = selectedVariants[product.id];
    const weight = selectedVariant ? selectedVariant.weight : product.weight;
    const price = selectedVariant ? selectedVariant.price : product.price;
    
    const message = `Hi! I'm interested in ordering ${product.displayName} (${weight}) - ₹${price}. Can you provide more details?`;
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
                    src={`${process.env.PUBLIC_URL}${product.image}`}
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

                {/* Weight Selector for products with variants */}
                <WeightSelector 
                  product={product}
                  onVariantChange={(variant) => handleVariantChange(product.id, variant)}
                  variant="compact"
                  showImagePreview={false}
                />

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
                    <div className="price-section">
                      <span className="product-price">₹{getProductPrice(product)}</span>
                      {getProductOriginalPrice(product) && getProductOriginalPrice(product) !== getProductPrice(product) && (
                        <span className="original-price">₹{getProductOriginalPrice(product)}</span>
                      )}
                    </div>
                    <span className="product-weight">({getProductWeight(product)})</span>
                  </div>
                  
                  <div className="product-actions">
                    <button className="product-favorite-btn">
                      <Heart size={18} />
                    </button>
                    <button 
                      onClick={() => handleWhatsApp(product)}
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
            onClick={() => navigate('/products')}
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
