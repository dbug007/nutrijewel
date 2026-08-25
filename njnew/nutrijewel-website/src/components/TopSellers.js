import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { featuredTopSellers } from '../data/products';
import WeightSelector from './WeightSelector';
import { cardVariants, getRevealProps, hoverLift, tapShrink } from './motionPresets';
import TiltCard from './TiltCard';
import { useAutoScroll } from '../hooks/useAutoScroll';
import WishlistHeart from './store/WishlistHeart';
import AddToCartButton from './store/AddToCartButton';
import './TopSellers.css';

const TopSellers = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const revealProps = getRevealProps(reduceMotion);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 767);
  const [selectedVariants, setSelectedVariants] = useState({});
  const shelfRef = useRef(null);
  useAutoScroll(shelfRef, { interval: 4000 });

  const getLowestVariant = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    return product.variants.reduce((lowest, variant) => {
      return variant.price < lowest.price ? variant : lowest;
    }, product.variants[0]);
  };

  // Initialize default variants for products that have variants
  useEffect(() => {
    const initialVariants = {};
    featuredTopSellers.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        initialVariants[product.id] = getLowestVariant(product);
      }
    });
    setSelectedVariants(initialVariants);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleVariantChange = useCallback((productId, variant) => {
    setSelectedVariants(prev => {
      return {
        ...prev,
        [productId]: variant
      };
    });
  }, []);

  const getProductPrice = (product) => {
    const lowestVariant = getLowestVariant(product);
    if (lowestVariant) {
      return lowestVariant.price;
    }
    return product.price;
  };

  const getProductOriginalPrice = (product) => {
    const lowestVariant = getLowestVariant(product);
    if (lowestVariant && lowestVariant.originalPrice) {
      return lowestVariant.originalPrice;
    }
    return product.originalPrice;
  };

  const getProductWeight = (product) => {
    const lowestVariant = getLowestVariant(product);
    if (lowestVariant) {
      return lowestVariant.weight;
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

  const getProductImages = (product) => {
    return product.images && product.images.length > 0 ? product.images : [product.image];
  };

  const getActiveImage = (product) => getProductImages(product)[0];


  return (
    <motion.section id="products" className="top-sellers-section" {...revealProps} variants={cardVariants}>
      <div className="top-sellers-container">
        {/* Section Header */}
        <div className="top-sellers-header">
          <h2 className="top-sellers-title">
            Our <span className="top-sellers-hand-underline">Top Sellers</span>
          </h2>
          <p className="top-sellers-subtitle">
            Discover our most loved products - handcrafted with premium ingredients and packed with nutrition
          </p>
          <div className="top-sellers-divider"></div>
        </div>

        {isMobile ? (
          <div className="top-sellers-shelf" ref={shelfRef} aria-label="Top sellers">
            {featuredTopSellers.map((product) => (
              <article
                className="top-seller-shelf-card"
                key={product.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/products/${product.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/products/${product.id}`);
                  }
                }}
              >
                <div className="top-seller-image-wrap">
                  <img
                    src={getActiveImage(product)}
                    alt={product.name}
                    className="top-seller-image"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                  <WishlistHeart productId={product.id} className="on-image" />
                </div>
                <div className="top-seller-copy">
                  <div className="product-category-tag">{product.category}</div>
                  <div className="top-seller-flags">
                    {product.isBestSeller && (
                      <span className="top-seller-badge best" title="Best Seller" aria-label="Best Seller">⭐</span>
                    )}
                    {product.isChefsSpecial && (
                      <span className="top-seller-badge chef" title="Chef's Special" aria-label="Chef's Special">👩‍🍳</span>
                    )}
                  </div>
                  <h3 className="product-name">{product.displayName}</h3>
                  <div className="top-seller-price-row">
                    <span className="product-price">₹{getProductPrice(product)}</span>
                    {getProductOriginalPrice(product) && getProductOriginalPrice(product) > getProductPrice(product) && (
                      <span className="original-price">₹{getProductOriginalPrice(product)}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="top-sellers-desktop-grid">
            {featuredTopSellers.map((product) => (
              <TiltCard
                key={product.id}
                className="top-sellers-desktop-card"
                variants={cardVariants} initial="hidden" whileInView="visible"
                viewport={{ once: true, amount: 0.06, margin: '0px 0px -12% 0px' }}
                whileHover={reduceMotion ? undefined : hoverLift}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/products/${product.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/products/${product.id}`);
                  }
                }}
              >
                <div className="top-sellers-desktop-image-wrap">
                  <img
                    src={getActiveImage(product)}
                    alt={product.name}
                    className="top-seller-image"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </div>
                <WishlistHeart productId={product.id} className="on-image" />
                <div className="top-sellers-desktop-content">
                  <div className="product-category-tag">{product.category}</div>
                  <div className="top-seller-flags">
                    {product.isBestSeller && (
                      <span className="top-seller-badge best" title="Best Seller" aria-label="Best Seller">⭐</span>
                    )}
                    {product.isChefsSpecial && (
                      <span className="top-seller-badge chef" title="Chef's Special" aria-label="Chef's Special">👩‍🍳</span>
                    )}
                  </div>
                  <h3 className="product-name">{product.displayName}</h3>
                  <p className="product-modal-description">{product.description}</p>

                  <div onClick={(e) => e.stopPropagation()}>
                    <WeightSelector
                      product={product}
                      onVariantChange={(variant) => handleVariantChange(product.id, variant)}
                      variant="default"
                    />
                  </div>

                  <div className="top-seller-price-row">
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

                  <div className="nj-cta-row">
                    <AddToCartButton product={product} variant={selectedVariants[product.id]} className="full" />
                    <motion.button className="product-buy-btn" onClick={(e) => { e.stopPropagation(); handleWhatsApp(product); }} whileHover={reduceMotion ? undefined : { scale: 1.02 }} whileTap={tapShrink}>
                      <ShoppingBag size={18} />
                      Buy Now
                    </motion.button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}

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

    </motion.section>
  );
};

export default TopSellers;
