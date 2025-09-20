import React, { useState, useCallback } from 'react';
import { Star, Heart, ShoppingBag, Phone } from 'lucide-react';
import { products, categories } from '../data/products';
import WeightSelector from '../components/WeightSelector';
import './ProductsPage.css';

const ProductsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedVariants, setSelectedVariants] = useState({});

  // Initialize default variants for products that have variants
  React.useEffect(() => {
    const initialVariants = {};
    products.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        initialVariants[product.id] = product.variants[0];
      }
    });
    setSelectedVariants(initialVariants);
  }, []);

  const handleVariantChange = useCallback((productId, variant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variant
    }));
  }, []);

  const getProductPrice = (product) => {
    const selectedVariant = selectedVariants[product.id];
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

  const filteredProducts = selectedCategory === 'All Products' 
    ? products 
    : selectedCategory === 'Best Sellers'
    ? products.filter(product => product.isBestSeller)
    : selectedCategory === 'Chef\'s Specials'
    ? products.filter(product => product.isChefsSpecial)
    : products.filter(product => product.category === selectedCategory);

    const handlePurchase = (product) => {
    const selectedVariant = selectedVariants[product.id];
    const weight = selectedVariant ? selectedVariant.weight : product.weight;
    const price = selectedVariant ? selectedVariant.price : product.price;
    
    const message = `Hi! I'm interested in purchasing ${product.name} (${weight}) - ₹${price}. Can you please provide more details about availability and delivery?`;
    const whatsappUrl = `https://wa.me/919960637656?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="products-page">
      {/* Header Section */}
      <section className="products-header">
        <div className="products-container">
          <h1 className="products-title">
            Our <span className="products-title-green">Products</span>
          </h1>
          <p className="products-subtitle">
            Discover our range of clean, handcrafted, nutritious products designed to promote health and happiness.
          </p>
          <div className="products-divider"></div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="products-filter">
        <div className="products-container">
          <div className="filter-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-grid-section">
        <div className="products-container">
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                {/* Special Tags at Very Top of Card */}
                <div className="product-corner-tags">
                  {product.isBestSeller && (
                    <div className="product-corner-tag best-seller" title="Best Seller">⭐</div>
                  )}
                  {product.isChefsSpecial && (
                    <div className="product-corner-tag chefs-special" title="Chef's Special">👨‍🍳</div>
                  )}
                </div>
                
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-overlay">
                    <button className="wishlist-btn">
                      <Heart size={20} />
                    </button>
                  </div>
                </div>
                <div className="product-content">
                  <div className="product-category-tag">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  {/* Weight Selector for products with variants */}
                  <WeightSelector 
                    product={product}
                    onVariantChange={(variant) => handleVariantChange(product.id, variant)}
                    variant="default"
                  />

                  {/* Rating */}
                  <div className="product-rating">
                    <div className="product-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className="star-filled"
                        />
                      ))}
                      <span className="rating-number">5.0</span>
                    </div>
                    <span className="product-reviews">(150+ reviews)</span>
                  </div>

                  {/* Features */}
                  <div className="product-benefits">
                    {product.features && product.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="benefit-tag">{feature}</span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="product-pricing">
                    <div className="price-container">
                      <span className="product-price">₹{getProductPrice(product)}</span>
                      {getProductOriginalPrice(product) && getProductOriginalPrice(product) > getProductPrice(product) && (
                        <>
                          <span className="original-price">₹{getProductOriginalPrice(product)}</span>
                          <span className="discount-badge">
                            {Math.round(((getProductOriginalPrice(product) - getProductPrice(product)) / getProductOriginalPrice(product)) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <span className="product-weight">{getProductWeight(product)}</span>
                  </div>

                  {/* Buy Button */}
                  <button 
                    className="product-buy-btn"
                    onClick={() => handlePurchase(product)}
                  >
                    <ShoppingBag size={18} />
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="products-cta">
        <div className="products-container">
          <div className="cta-content">
            <h2>Can't Find What You're Looking For?</h2>
            <p>Let us know your preferences and we'll create something special just for you!</p>
            <div className="cta-buttons">
              <button 
                className="cta-btn"
                onClick={() => {
                  const message = "Hi! I'm interested in custom product consultation. Can you help me create something special based on my preferences?";
                  const whatsappUrl = `https://wa.me/919960637656?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                Get Custom Products
              </button>
              <button 
                className="cta-btn cta-btn-call"
                onClick={() => {
                  window.open('tel:+919960637656', '_self');
                }}
              >
                <Phone size={18} />
                Call Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
