import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Phone, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { products } from '../data/products';
import WeightSelector from '../components/WeightSelector';
import { imageCrossfade, imageFadeTransition } from '../components/motionPresets';
import { scrollToId } from '../lib/smoothScroll';
import WishlistHeart from '../components/store/WishlistHeart';
import AddToCartButton from '../components/store/AddToCartButton';
import './ProductsPage.css';

const CATEGORIES = [
  { id: 'cakes',              name: 'Cakes',              emoji: '🎂' },
  { id: 'traditional-sweets', name: 'Traditional Sweets', emoji: '🍡' },
  { id: 'healthy-snacks',     name: 'Healthy Snacks',     emoji: '🌿' },
  { id: 'energy-bars',        name: 'Energy Bars',        emoji: '⚡' },
  { id: 'dips-spreads',       name: 'Dips & Spreads',     emoji: '🥑' },
  { id: 'seasonal',           name: 'Seasonal',           emoji: '🎊' },
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
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
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

  const scrollToCategory = (id) => scrollToId(id);

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
              <span className="pill-emoji">{cat.emoji} </span>{cat.name}
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
                        onClick={() => navigate(`/products/${product.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/products/${product.id}`);
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
                          <WishlistHeart productId={product.id} className="on-image" />
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
                            <div className="card-desktop-extra" onClick={(e) => e.stopPropagation()}>
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
                                  <div className="nj-cta-row">
                                    <AddToCartButton product={product} variant={selectedVariants[product.id]} className="full" />
                                    <button className="product-buy-btn" onClick={() => handlePurchase(product)}>
                                      <ShoppingBag size={17} />
                                      Buy Now
                                    </button>
                                  </div>
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
