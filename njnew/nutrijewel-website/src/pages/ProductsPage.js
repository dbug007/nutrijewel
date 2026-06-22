import React, { useState, useCallback, useEffect } from 'react';
import { ShoppingBag, Phone, X, Star, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { products } from '../data/products';
import WeightSelector from '../components/WeightSelector';
import { imageCrossfade, imageFadeTransition, smoothEase } from '../components/motionPresets';
import './ProductsPage.css';

const CATEGORIES = [
  { id: 'cakes',              name: 'Cakes',              emoji: '🎂' },
  { id: 'traditional-sweets', name: 'Traditional Sweets', emoji: '🍡' },
  { id: 'healthy-snacks',     name: 'Healthy Snacks',     emoji: '🌿' },
  { id: 'energy-bars',        name: 'Energy Bars',        emoji: '⚡' },
  { id: 'dips-spreads',       name: 'Dips & Spreads',     emoji: '🥑' },
];

const SORT_LABELS = {
  default:       'Sort: Default',
  'price-asc':   'Price: Low → High',
  'price-desc':  'Price: High → Low',
  'best-sellers':'Best Sellers First',
};

const ProductsPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 767);
  const [sortBy, setSortBy] = useState('default');
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeCategory, setActiveCategory] = useState('cakes');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [imageIndexes, setImageIndexes] = useState({});
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalProductDirection, setModalProductDirection] = useState(1);
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0);
  const [modalCategoryProducts, setModalCategoryProducts] = useState([]);
  const reduceMotion = useReducedMotion();

  const modalSlideVariants = {
    enter: (direction) => ({ x: reduceMotion ? 0 : (direction > 0 ? 64 : -64), opacity: 1 }),
    center: { x: 0, opacity: 1 },
    exit:  (direction) => ({ x: reduceMotion ? 0 : (direction > 0 ? -64 : 64), opacity: 1 }),
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
      if (!mobile) setActiveProduct(null);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLowestVariant = (product) => {
    if (!product.variants || product.variants.length === 0) return null;
    return product.variants.reduce((lowest, v) => v.price < lowest.price ? v : lowest, product.variants[0]);
  };

  useEffect(() => {
    const initialVariants = {};
    products.forEach(product => {
      if (product.variants && product.variants.length > 0)
        initialVariants[product.id] = getLowestVariant(product);
    });
    setSelectedVariants(initialVariants);
  }, []);

  useEffect(() => {
    const init = {};
    products.forEach(p => { init[p.id] = 0; });
    setImageIndexes(init);
    const timer = setInterval(() => {
      setImageIndexes(prev => {
        const next = { ...prev };
        products.forEach(p => {
          const imgs = p.images && p.images.length > 0 ? p.images : [p.image];
          next[p.id] = ((prev[p.id] ?? 0) + 1) % imgs.length;
        });
        return next;
      });
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveCategory(e.target.id); }),
      { rootMargin: '-20% 0px -70% 0px' }
    );
    CATEGORIES.forEach(cat => {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const getProductPrice = (product) => {
    const lv = getLowestVariant(product);
    return lv ? lv.price : product.price;
  };

  const getProductOriginalPrice = (product) => {
    const lv = getLowestVariant(product);
    if (lv && lv.originalPrice) return lv.originalPrice;
    return product.originalPrice;
  };

  const getProductWeight = (product) => {
    const lv = getLowestVariant(product);
    return lv ? lv.weight : product.weight;
  };

  const getProductsForCategory = (categoryName) => {
    let prods = products.filter(p => p.category === categoryName);
    if (activeFilters.includes('bestSeller'))   prods = prods.filter(p => p.isBestSeller);
    if (activeFilters.includes('chefsSpecial')) prods = prods.filter(p => p.isChefsSpecial);

    // "Coming Soon" items always sit at the end of every category.
    const available  = prods.filter(p => !p.comingSoon);
    const comingSoon = prods.filter(p => p.comingSoon);

    if (sortBy === 'price-asc')       available.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    else if (sortBy === 'price-desc') available.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    else                              available.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)); // default + best-sellers: best sellers first

    return [...available, ...comingSoon];
  };

  const getProductImages    = (p) => p.images && p.images.length > 0 ? p.images : [p.image];
  const getProductImageIndex = (p) => imageIndexes[p.id] ?? 0;
  const getActiveProductImage = (p) => {
    const imgs = getProductImages(p);
    return imgs[(imageIndexes[p.id] ?? 0) % imgs.length];
  };

  const openProductModal = (product, categoryProducts) => {
    setModalProductDirection(1);
    setActiveProduct(product);
    setActiveModalImageIndex(0);
    setModalCategoryProducts(categoryProducts);
  };

  const closeProductModal = () => {
    setActiveProduct(null);
    setActiveModalImageIndex(0);
    setModalCategoryProducts([]);
  };

  const getActiveModalImage = (product) => {
    const imgs = getProductImages(product);
    return imgs[activeModalImageIndex % imgs.length];
  };

  const showPreviousModalProduct = () => {
    if (!activeProduct || !modalCategoryProducts.length) return;
    const idx = modalCategoryProducts.findIndex(p => p.id === activeProduct.id);
    if (idx < 0) return;
    const next = (idx - 1 + modalCategoryProducts.length) % modalCategoryProducts.length;
    setModalProductDirection(-1);
    setActiveProduct(modalCategoryProducts[next]);
    setActiveModalImageIndex(0);
  };

  const showNextModalProduct = () => {
    if (!activeProduct || !modalCategoryProducts.length) return;
    const idx = modalCategoryProducts.findIndex(p => p.id === activeProduct.id);
    if (idx < 0) return;
    const next = (idx + 1) % modalCategoryProducts.length;
    setModalProductDirection(1);
    setActiveProduct(modalCategoryProducts[next]);
    setActiveModalImageIndex(0);
  };

  const handleVariantChange = useCallback((productId, variant) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variant }));
  }, []);

  const handlePurchase = (product) => {
    const sv = selectedVariants[product.id];
    const weight = sv ? sv.weight : product.weight;
    const price  = sv ? sv.price  : product.price;
    const msg = `Hi! I'm interested in purchasing ${product.name} (${weight}) - ₹${price}. Can you please provide more details about availability and delivery?`;
    window.open(`https://wa.me/919960637656?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const scrollToCategory = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="products-page" onClick={() => sortOpen && setSortOpen(false)}>

      {/* ── Header ── */}
      <section className="products-header">
        <div className="products-container">
          <h1 className="products-title">
            Our <span className="products-title-green">Products</span>
          </h1>
          <p className="products-subtitle">
            Handcrafted, nutritious snacks by a Registered Pharmacist &amp; Qualified Nutritionist.
          </p>
          <div className="products-divider"></div>
        </div>
      </section>

      {/* ── Controls: Filter chips + Sort ── */}
      <div className="products-controls">
        <div className="products-container">
          <div className="controls-row">
            <div className="filter-chips">
              <button
                className={`filter-chip${activeFilters.includes('bestSeller') ? ' active' : ''}`}
                onClick={() => toggleFilter('bestSeller')}
                aria-label="Best Sellers"
                title="Best Sellers"
              >
                <span className="filter-chip-icon">⭐</span>
                <span className="filter-chip-label">Best Sellers</span>
              </button>
              <button
                className={`filter-chip${activeFilters.includes('chefsSpecial') ? ' active' : ''}`}
                onClick={() => toggleFilter('chefsSpecial')}
                aria-label="Chef's Special"
                title="Chef's Special"
              >
                <span className="filter-chip-icon">🧑‍🍳</span>
                <span className="filter-chip-label">Chef's Special</span>
              </button>
            </div>
            <div className="sort-dropdown-wrap">
              <button
                className="sort-btn"
                onClick={(e) => { e.stopPropagation(); setSortOpen(prev => !prev); }}
              >
                <SlidersHorizontal size={14} />
                {SORT_LABELS[sortBy]}
                <ChevronDown size={13} className={`sort-chevron${sortOpen ? ' open' : ''}`} />
              </button>
              {sortOpen && (
                <div className="sort-menu" onClick={e => e.stopPropagation()}>
                  {Object.entries(SORT_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      className={`sort-option${sortBy === key ? ' active' : ''}`}
                      onClick={() => { setSortBy(key); setSortOpen(false); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Category Pill Nav ── */}
      <nav className="category-pill-nav" aria-label="Product categories">
        <div className="pill-nav-inner">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`pill-btn${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => scrollToCategory(cat.id)}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Category Sections ── */}
      <div className="categories-wrapper">
        {CATEGORIES.map(cat => {
          const catProducts = getProductsForCategory(cat.name);
          return (
            <section
              key={cat.id}
              id={cat.id}
              className="category-section"
            >
              {/* Category Header */}
              <div className="category-header">
                <div className="products-container">
                  <div className="cat-header-content">
                    <span className="cat-emoji">{cat.emoji}</span>
                    <h2 className="cat-title">{cat.name}</h2>
                    <span className="cat-count">
                      {catProducts.length} item{catProducts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="cat-divider" />
                </div>
              </div>

              {/* Products */}
              <div className="products-container">
                {catProducts.length === 0 ? (
                  <p className="cat-empty">No products match your current filters in this category.</p>
                ) : (
                  <div className="products-scroll-row">
                    {catProducts.map(product => (
                      <div
                        key={product.id}
                        className="product-card-new"
                        onClick={() => isMobile && openProductModal(product, catProducts)}
                        role={isMobile ? 'button' : undefined}
                        tabIndex={isMobile ? 0 : -1}
                        onKeyDown={(e) => {
                          if (isMobile && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            openProductModal(product, catProducts);
                          }
                        }}
                      >
                        {/* Image band with pastel background */}
                        <div className={`card-image-band${product.comingSoon ? ' is-coming-soon' : ''}`}>
                          <AnimatePresence initial={false} custom={1} mode="sync">
                            <motion.img
                              key={`${product.id}-${getProductImageIndex(product)}`}
                              src={getActiveProductImage(product)}
                              alt={product.name}
                              className="card-img"
                              loading="lazy"
                              decoding="async"
                              variants={imageCrossfade}
                              initial="enter"
                              animate="center"
                              exit="exit"
                              transition={reduceMotion ? { duration: 0 } : imageFadeTransition}
                            />
                          </AnimatePresence>
                          {getProductImages(product).length > 1 && (
                            <div className="card-img-dots">
                              {getProductImages(product).map((_, idx) => (
                                <span
                                  key={idx}
                                  className={`card-img-dot${idx === getProductImageIndex(product) ? ' active' : ''}`}
                                />
                              ))}
                            </div>
                          )}
                          <div className="card-badges">
                            {product.isBestSeller  && <span className="product-card-flag best" title="Best Seller">⭐</span>}
                            {product.isChefsSpecial && <span className="product-card-flag chef" title="Chef's Special">🧑‍🍳</span>}
                          </div>
                          {product.comingSoon && <div className="coming-soon-overlay"><span>Coming Soon</span></div>}
                        </div>

                        {/* Card content */}
                        <div className="card-content">
                          <h3 className="card-name">{product.name}</h3>
                          {product.comingSoon ? (
                            <div className="card-pricing">
                              <span className="card-coming-soon">Coming Soon</span>
                            </div>
                          ) : (
                            <>
                              <div className="card-pricing">
                                <span className="card-price">₹{getProductPrice(product)}</span>
                                {getProductOriginalPrice(product) > getProductPrice(product) && (
                                  <>
                                    <span className="card-original-price">₹{getProductOriginalPrice(product)}</span>
                                    <span className="card-discount">
                                      {Math.round(((getProductOriginalPrice(product) - getProductPrice(product)) / getProductOriginalPrice(product)) * 100)}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                              <span className="card-weight">{getProductWeight(product)}</span>
                            </>
                          )}

                          {!isMobile && (
                            <div className="card-desktop-extra">
                              <p className="card-description">{product.description}</p>
                              {product.comingSoon ? (
                                <button className="product-buy-btn product-buy-btn--soon" disabled>
                                  Coming Soon
                                </button>
                              ) : (
                                <>
                                  <WeightSelector
                                    product={product}
                                    onVariantChange={(variant) => handleVariantChange(product.id, variant)}
                                    variant="default"
                                  />
                                  <div className="card-benefits">
                                    {product.features && product.features.slice(0, 3).map((f, i) => (
                                      <span key={i} className="benefit-tag">{f}</span>
                                    ))}
                                  </div>
                                  <button className="product-buy-btn" onClick={() => handlePurchase(product)}>
                                    <ShoppingBag size={17} />
                                    Buy Now
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Mobile Product Modal ── */}
      {isMobile && activeProduct && (
        <div className="products-modal-backdrop" onClick={closeProductModal}>
          <div className="products-modal" onClick={(e) => e.stopPropagation()}>
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
                <div className={`products-modal-image-wrap${activeProduct.comingSoon ? ' is-coming-soon' : ''}`}>
                  <AnimatePresence initial={false} custom={1} mode="sync">
                    <motion.img
                      key={`${activeProduct.id}-${activeModalImageIndex}`}
                      src={getActiveModalImage(activeProduct)}
                      alt={activeProduct.name}
                      className="products-modal-image"
                      loading="lazy"
                      decoding="async"
                      variants={imageCrossfade}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: smoothEase }}
                    />
                  </AnimatePresence>
                  {modalCategoryProducts.length > 1 && (
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
                    <div className="modal-image-dots">
                      {getProductImages(activeProduct).map((image, index) => (
                        <button
                          key={image}
                          className={`modal-image-dot${index === activeModalImageIndex ? ' active' : ''}`}
                          onClick={() => setActiveModalImageIndex(index)}
                          aria-label={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  {activeProduct.comingSoon && <div className="coming-soon-overlay"><span>Coming Soon</span></div>}
                </div>

                <div className="products-modal-content">
                  {(() => {
                    const catInfo = CATEGORIES.find(c => c.name === activeProduct.category);
                    return (
                      <div className="product-category-tag">
                        {catInfo?.emoji} {activeProduct.category}
                      </div>
                    );
                  })()}
                  <div className="product-card-flags products-modal-flags">
                    {activeProduct.isBestSeller  && <span className="product-card-flag best" title="Best Seller">⭐</span>}
                    {activeProduct.isChefsSpecial && <span className="product-card-flag chef" title="Chef's Special">🧑‍🍳</span>}
                  </div>
                  <h3 className="products-modal-title">{activeProduct.name}</h3>
                  <p className="products-modal-description">{activeProduct.description}</p>
                  {!activeProduct.comingSoon && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <WeightSelector
                        product={activeProduct}
                        onVariantChange={(variant) => handleVariantChange(activeProduct.id, variant)}
                        variant="default"
                      />
                    </div>
                  )}
                  <div className="products-modal-benefits">
                    {activeProduct.features && activeProduct.features.map((feature, i) => (
                      <span key={i} className="benefit-tag">{feature}</span>
                    ))}
                  </div>
                  {!activeProduct.comingSoon && (
                    <div className="products-modal-rating">
                      <div className="products-modal-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="star-filled" fill="currentColor" />
                        ))}
                        <span className="rating-number">5.0</span>
                      </div>
                      <span className="products-modal-reviews">(150+ reviews)</span>
                    </div>
                  )}
                  <div className="products-modal-footer">
                    {activeProduct.comingSoon ? (
                      <>
                        <div className="product-pricing">
                          <span className="card-coming-soon">Coming Soon</span>
                        </div>
                        <button className="product-buy-btn product-buy-btn--soon" disabled>
                          Coming Soon
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="product-pricing">
                          <div className="price-container">
                            <span className="product-price">₹{getProductPrice(activeProduct)}</span>
                            {getProductOriginalPrice(activeProduct) > getProductPrice(activeProduct) && (
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
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <section className="products-cta">
        <div className="products-container">
          <div className="cta-content">
            <h2>Can't Find What You're Looking For?</h2>
            <p>Let us know your preferences and we'll create something special just for you!</p>
            <div className="cta-buttons">
              <button
                className="cta-btn"
                onClick={() => {
                  const msg = "Hi! I'm interested in custom product consultation. Can you help me create something special based on my preferences?";
                  window.open(`https://wa.me/919960637656?text=${encodeURIComponent(msg)}`, '_blank');
                }}
              >
                Get Custom Products
              </button>
              <button className="cta-btn cta-btn-call" onClick={() => window.open('tel:+919960637656', '_self')}>
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
