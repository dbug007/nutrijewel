import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, useDragControls } from 'motion/react';
import { ShoppingBag, ChevronLeft, ChevronRight, X, Star } from 'lucide-react';
import { featuredTopSellers } from '../data/products';
import WeightSelector from './WeightSelector';
import { cardVariants, getRevealProps, hoverLift, tapShrink } from './motionPresets';
import { useAutoScroll } from '../hooks/useAutoScroll';
import WishlistHeart from './store/WishlistHeart';
import AddToCartButton from './store/AddToCartButton';
import './TopSellers.css';

const TopSellers = () => {
  const SWIPE_THRESHOLD = 70;
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const modalDragControls = useDragControls();
  const revealProps = getRevealProps(reduceMotion);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 767);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalProductDirection, setModalProductDirection] = useState(1);
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0);
  const modalTouchStartXRef = useRef(0);
  const shelfRef = useRef(null);
  useAutoScroll(shelfRef, { interval: 4000 });

  const modalProductVariants = {
    enter: (direction) => ({
      x: reduceMotion ? 0 : (direction > 0 ? 70 : -70),
      opacity: reduceMotion ? 1 : 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: reduceMotion ? 0 : (direction > 0 ? -70 : 70),
      opacity: reduceMotion ? 1 : 0
    })
  };

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
      if (!mobile) {
        setActiveProduct(null);
      }
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

  const getActiveModalImage = (product) => {
    const images = getProductImages(product);
    return images[activeModalImageIndex % images.length];
  };

  const showPreviousModalImage = () => {
    if (!activeProduct) {
      return;
    }
    const images = getProductImages(activeProduct);
    if (images.length <= 1) {
      return;
    }
    setActiveModalImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const showNextModalImage = () => {
    if (!activeProduct) {
      return;
    }
    const images = getProductImages(activeProduct);
    if (images.length <= 1) {
      return;
    }
    setActiveModalImageIndex(prev => (prev + 1) % images.length);
  };

  const openProductModal = (product) => {
    setActiveProduct(product);
    setActiveModalImageIndex(0);
  };

  const closeProductModal = () => {
    setActiveProduct(null);
    setActiveModalImageIndex(0);
  };

  const showPreviousModalProduct = () => {
    if (!activeProduct) {
      return;
    }
    const currentIndex = featuredTopSellers.findIndex(product => product.id === activeProduct.id);
    if (currentIndex < 0) {
      return;
    }
    const nextIndex = (currentIndex - 1 + featuredTopSellers.length) % featuredTopSellers.length;
    setModalProductDirection(-1);
    setActiveProduct(featuredTopSellers[nextIndex]);
    setActiveModalImageIndex(0);
  };

  const showNextModalProduct = () => {
    if (!activeProduct) {
      return;
    }
    const currentIndex = featuredTopSellers.findIndex(product => product.id === activeProduct.id);
    if (currentIndex < 0) {
      return;
    }
    const nextIndex = (currentIndex + 1) % featuredTopSellers.length;
    setModalProductDirection(1);
    setActiveProduct(featuredTopSellers[nextIndex]);
    setActiveModalImageIndex(0);
  };

  const handleModalTouchStart = (event) => {
    modalTouchStartXRef.current = event.touches[0].clientX;
  };

  const handleModalTouchEnd = (event) => {
    const deltaX = modalTouchStartXRef.current - event.changedTouches[0].clientX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    if (deltaX > 0) {
      showNextModalImage();
    } else {
      showPreviousModalImage();
    }
  };

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
                onClick={() => openProductModal(product)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openProductModal(product);
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
              <motion.article key={product.id} className="top-sellers-desktop-card" variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.06, margin: '0px 0px -12% 0px' }} whileHover={reduceMotion ? undefined : hoverLift}>
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

                  <WeightSelector
                    product={product}
                    onVariantChange={(variant) => handleVariantChange(product.id, variant)}
                    variant="default"
                  />

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
                    <motion.button className="product-buy-btn" onClick={() => handleWhatsApp(product)} whileHover={reduceMotion ? undefined : { scale: 1.02 }} whileTap={tapShrink}>
                      <ShoppingBag size={18} />
                      Buy Now
                    </motion.button>
                  </div>
                </div>
              </motion.article>
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

      <AnimatePresence>
      {isMobile && activeProduct && (
        <motion.div className="product-modal-backdrop" onClick={closeProductModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="product-modal"
            onClick={(event) => event.stopPropagation()}
            drag="y"
            dragListener={false}
            dragControls={modalDragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(e, info) => { if (info.offset.y > 120 || info.velocity.y > 600) closeProductModal(); }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <span className="modal-grabber" onPointerDown={(e) => modalDragControls.start(e)} aria-hidden="true">
              <span className="modal-grabber-pill" />
            </span>
            <button className="product-modal-close" onClick={closeProductModal} aria-label="Close product details">
              <X size={18} />
            </button>
            <AnimatePresence initial={false} custom={modalProductDirection} mode="wait">
              <motion.div
                className="product-modal-body"
                key={activeProduct.id}
                custom={modalProductDirection}
                variants={modalProductVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="product-modal-image-wrap" onTouchStart={handleModalTouchStart} onTouchEnd={handleModalTouchEnd}>
                  <img
                    src={getActiveModalImage(activeProduct)}
                    alt={activeProduct.name}
                    className="product-modal-image"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                  {featuredTopSellers.length > 1 && (
                    <>
                      <motion.button className="modal-image-arrow modal-image-arrow-left" onClick={showPreviousModalProduct} aria-label="Previous product" whileHover={reduceMotion ? undefined : { scale: 1.06 }} whileTap={tapShrink}>
                        <ChevronLeft size={18} />
                      </motion.button>
                      <motion.button className="modal-image-arrow modal-image-arrow-right" onClick={showNextModalProduct} aria-label="Next product" whileHover={reduceMotion ? undefined : { scale: 1.06 }} whileTap={tapShrink}>
                        <ChevronRight size={18} />
                      </motion.button>
                    </>
                  )}
                  {getProductImages(activeProduct).length > 1 && (
                    <>
                      <div className="modal-image-dots">
                        {getProductImages(activeProduct).map((image, index) => (
                          <motion.button
                            key={image}
                            className={`modal-image-dot ${index === activeModalImageIndex ? 'active' : ''}`}
                            onClick={() => setActiveModalImageIndex(index)}
                            aria-label={`View image ${index + 1}`}
                            whileHover={reduceMotion ? undefined : { scale: 1.18 }}
                            whileTap={tapShrink}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <WishlistHeart productId={activeProduct.id} className="on-image on-modal" />
                </div>
                <div className="product-modal-content">
                  <div className="product-category-tag">{activeProduct.category}</div>
                  <div className="top-seller-flags">
                    {activeProduct.isBestSeller && (
                      <span className="top-seller-badge best" title="Best Seller" aria-label="Best Seller">⭐</span>
                    )}
                    {activeProduct.isChefsSpecial && (
                      <span className="top-seller-badge chef" title="Chef's Special" aria-label="Chef's Special">👩‍🍳</span>
                    )}
                  </div>
                  <h3 className="product-modal-title">{activeProduct.displayName}</h3>
                  <p className="product-modal-description">{activeProduct.description}</p>

                  <div onClick={(event) => event.stopPropagation()}>
                    <WeightSelector
                      product={activeProduct}
                      onVariantChange={(variant) => handleVariantChange(activeProduct.id, variant)}
                      variant="default"
                    />
                  </div>

                  <div className="product-modal-benefits">
                    {activeProduct.features && activeProduct.features.map((feature, index) => (
                      <span key={index} className="benefit-tag">{feature}</span>
                    ))}
                  </div>

                  <div className="top-modal-rating">
                    <div className="top-modal-stars">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} size={16} className="top-modal-star" fill="currentColor" />
                      ))}
                      <span className="rating-number">5.0</span>
                    </div>
                    <span className="top-modal-reviews">(150+ reviews)</span>
                  </div>

                  <div className="product-modal-footer">
                    <div className="product-pricing">
                      <div className="price-container">
                        <span className="product-price">₹{getProductPrice(activeProduct)}</span>
                        {getProductOriginalPrice(activeProduct) && getProductOriginalPrice(activeProduct) > getProductPrice(activeProduct) && (
                          <>
                            <span className="original-price">₹{getProductOriginalPrice(activeProduct)}</span>
                            <span className="discount-badge">
                              {Math.round(((getProductOriginalPrice(activeProduct) - getProductPrice(activeProduct)) / getProductOriginalPrice(activeProduct)) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                      <span className="product-weight">{getProductWeight(activeProduct)}</span>
                    </div>

                    <div className="nj-cta-row">
                      <AddToCartButton product={activeProduct} variant={selectedVariants[activeProduct.id]} className="full" />
                      <motion.button className="product-buy-btn" onClick={() => handleWhatsApp(activeProduct)} whileHover={reduceMotion ? undefined : { scale: 1.02 }} whileTap={tapShrink}>
                        <ShoppingBag size={18} />
                        Buy Now
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.section>
  );
};

export default TopSellers;
