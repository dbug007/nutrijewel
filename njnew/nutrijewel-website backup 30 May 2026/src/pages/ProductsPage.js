import React, { useState, useCallback, useEffect } from 'react';
import { ShoppingBag, Phone, X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { products, categories } from '../data/products';
import WeightSelector from '../components/WeightSelector';
import './ProductsPage.css';

const ProductsPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 767);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [imageIndexes, setImageIndexes] = useState({});
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalProductDirection, setModalProductDirection] = useState(1);
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  const slideVariants = {
    enter: (direction) => ({
      x: reduceMotion ? 0 : (direction > 0 ? 24 : -24),
      opacity: 1
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: reduceMotion ? 0 : (direction > 0 ? -24 : 24),
      opacity: 1
    })
  };

  const modalSlideVariants = {
    enter: (direction) => ({
      x: reduceMotion ? 0 : (direction > 0 ? 64 : -64),
      opacity: 1
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: reduceMotion ? 0 : (direction > 0 ? -64 : 64),
      opacity: 1
    })
  };

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
    products.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        initialVariants[product.id] = getLowestVariant(product);
      }
    });
    setSelectedVariants(initialVariants);
  }, []);

  useEffect(() => {
    const initialImageIndexes = {};
    products.forEach(product => {
      initialImageIndexes[product.id] = 0;
    });
    setImageIndexes(initialImageIndexes);

    const slideTimer = setInterval(() => {
      setImageIndexes(prev => {
        const next = { ...prev };
        products.forEach(product => {
          const images = product.images && product.images.length > 0 ? product.images : [product.image];
          const current = prev[product.id] ?? 0;
          next[product.id] = (current + 1) % images.length;
        });
        return next;
      });
    }, 2500);

    return () => clearInterval(slideTimer);
  }, []);

  const getActiveProductImage = (product) => {
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const currentIndex = imageIndexes[product.id] ?? 0;
    return images[currentIndex % images.length];
  };

  const getProductImages = (product) => {
    return product.images && product.images.length > 0 ? product.images : [product.image];
  };

  const getProductImageIndex = (product) => imageIndexes[product.id] ?? 0;

  const openProductModal = (product) => {
    setModalProductDirection(1);
    setActiveProduct(product);
    setActiveModalImageIndex(0);
  };

  const closeProductModal = () => {
    setActiveProduct(null);
    setActiveModalImageIndex(0);
  };

  const getActiveModalImage = (product) => {
    const images = getProductImages(product);
    return images[activeModalImageIndex % images.length];
  };

  const showPreviousModalProduct = () => {
    if (!activeProduct) {
      return;
    }
    const currentIndex = filteredProducts.findIndex(product => product.id === activeProduct.id);
    if (currentIndex < 0 || filteredProducts.length === 0) {
      return;
    }
    const nextIndex = (currentIndex - 1 + filteredProducts.length) % filteredProducts.length;
    setModalProductDirection(-1);
    setActiveProduct(filteredProducts[nextIndex]);
    setActiveModalImageIndex(0);
  };

  const showNextModalProduct = () => {
    if (!activeProduct) {
      return;
    }
    const currentIndex = filteredProducts.findIndex(product => product.id === activeProduct.id);
    if (currentIndex < 0 || filteredProducts.length === 0) {
      return;
    }
    const nextIndex = (currentIndex + 1) % filteredProducts.length;
    setModalProductDirection(1);
    setActiveProduct(filteredProducts[nextIndex]);
    setActiveModalImageIndex(0);
  };

  const handleVariantChange = useCallback((productId, variant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variant
    }));
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
          <div className="products-filter-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`products-filter-btn ${selectedCategory === category ? 'active' : ''}`}
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
              <div
                key={product.id}
                className="product-card"
                onClick={() => {
                  if (isMobile) {
                    openProductModal(product);
                  }
                }}
                role={isMobile ? 'button' : undefined}
                tabIndex={isMobile ? 0 : -1}
                onKeyDown={(event) => {
                  if (isMobile && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    openProductModal(product);
                  }
                }}
              >
                <div className="product-image-wrapper">
                  <AnimatePresence initial={false} custom={1} mode="sync">
                    <motion.img
                      key={`${product.id}-${getProductImageIndex(product)}`}
                      src={getActiveProductImage(product)}
                      alt={product.name}
                      className="product-image product-image-slide"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    />
                  </AnimatePresence>
                  {getProductImages(product).length > 1 && (
                    <div className="product-image-dots">
                      {getProductImages(product).map((_, idx) => (
                        <span
                          key={idx}
                          className={`product-image-dot ${idx === (imageIndexes[product.id] ?? 0) ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="product-content">
                  <div className="product-category-tag">{product.category}</div>
                  <div className="product-card-flags">
                    {product.isBestSeller && (
                      <span
                        className="product-card-flag best"
                        title="Best Seller"
                        aria-label="Best Seller"
                      >
                        ⭐
                      </span>
                    )}
                    {product.isChefsSpecial && (
                      <span
                        className="product-card-flag chef"
                        title="Chef's Special"
                        aria-label="Chef's Special"
                      >
                        🧑‍🍳
                      </span>
                    )}
                  </div>
                  <h3 className="product-name">{product.name}</h3>

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

                  {!isMobile && (
                    <div className="product-desktop-details">
                      <p className="product-description">{product.description}</p>

                      <WeightSelector
                        product={product}
                        onVariantChange={(variant) => handleVariantChange(product.id, variant)}
                        variant="default"
                      />

                      <div className="products-modal-rating">
                        <div className="products-modal-stars">
                          {[...Array(5)].map((_, index) => (
                            <Star key={index} size={16} className="star-filled" fill="currentColor" />
                          ))}
                          <span className="rating-number">5.0</span>
                        </div>
                        <span className="products-modal-reviews">(150+ reviews)</span>
                      </div>

                      <div className="products-modal-benefits">
                        {product.features && product.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="benefit-tag">{feature}</span>
                        ))}
                      </div>

                      <button className="product-buy-btn" onClick={() => handlePurchase(product)}>
                        <ShoppingBag size={18} />
                        Buy Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isMobile && activeProduct && (
        <div className="products-modal-backdrop" onClick={closeProductModal}>
          <div className="products-modal" onClick={(event) => event.stopPropagation()}>
            <button className="products-modal-close" onClick={closeProductModal} aria-label="Close product details">
              <X size={18} />
            </button>

            <AnimatePresence initial={false} custom={modalProductDirection} mode="sync">
              <motion.div
                key={activeProduct.id}
                className="products-modal-body"
                custom={modalProductDirection}
                variants={modalSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="products-modal-image-wrap">
                  <AnimatePresence initial={false} custom={1} mode="sync">
                    <motion.img
                      key={`${activeProduct.id}-${activeModalImageIndex}`}
                      src={getActiveModalImage(activeProduct)}
                      alt={activeProduct.name}
                      className="products-modal-image"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    />
                  </AnimatePresence>
                  {filteredProducts.length > 1 && (
                    <>
                      <button className="modal-image-arrow modal-image-arrow-left" onClick={showPreviousModalProduct} aria-label="Previous product">
                        <ChevronLeft size={18} />
                      </button>
                      <button className="modal-image-arrow modal-image-arrow-right" onClick={showNextModalProduct} aria-label="Next product">
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                  {getProductImages(activeProduct).length > 1 && (
                    <>
                      <div className="modal-image-dots">
                        {getProductImages(activeProduct).map((image, index) => (
                          <button
                            key={image}
                            className={`modal-image-dot ${index === activeModalImageIndex ? 'active' : ''}`}
                            onClick={() => setActiveModalImageIndex(index)}
                            aria-label={`View image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="products-modal-content">
                  <div className="product-category-tag">{activeProduct.category}</div>
                  <div className="product-card-flags products-modal-flags">
                    {activeProduct.isBestSeller && (
                      <span
                        className="product-card-flag best"
                        title="Best Seller"
                        aria-label="Best Seller"
                      >
                        ⭐
                      </span>
                    )}
                    {activeProduct.isChefsSpecial && (
                      <span
                        className="product-card-flag chef"
                        title="Chef's Special"
                        aria-label="Chef's Special"
                      >
                        🧑‍🍳
                      </span>
                    )}
                  </div>
                  <h3 className="products-modal-title">{activeProduct.name}</h3>
                  <p className="products-modal-description">{activeProduct.description}</p>

                  <div onClick={(event) => event.stopPropagation()}>
                    <WeightSelector
                      product={activeProduct}
                      onVariantChange={(variant) => handleVariantChange(activeProduct.id, variant)}
                      variant="default"
                    />
                  </div>

                  <div className="products-modal-benefits">
                    {activeProduct.features && activeProduct.features.map((feature, index) => (
                      <span key={index} className="benefit-tag">{feature}</span>
                    ))}
                  </div>

                  <div className="products-modal-rating">
                    <div className="products-modal-stars">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} size={16} className="star-filled" fill="currentColor" />
                      ))}
                      <span className="rating-number">5.0</span>
                    </div>
                    <span className="products-modal-reviews">(150+ reviews)</span>
                  </div>

                  <div className="products-modal-footer">
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

                    <button className="product-buy-btn" onClick={() => handlePurchase(activeProduct)}>
                      <ShoppingBag size={18} />
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

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
