import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Heart, ChevronDown, MessageCircle } from 'lucide-react';
import { useHeaderReveal } from '../hooks/useHeaderReveal';
import { useStore } from '../store/StoreContext';
import { OCCASIONS } from '../data/hampers';
import { scrollToId } from '../lib/smoothScroll';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import './store/store.css';
import './Navbar.css';

/* The occasions worth surfacing straight from the nav. Everything else lives on
   the /hampers occasion rail. */
const NAV_OCCASION_IDS = ['diwali', 'raksha-bandhan', 'wedding', 'corporate', 'christmas', 'new-mom'];
const NAV_OCCASIONS = NAV_OCCASION_IDS
  .map((id) => OCCASIONS.find((o) => o.id === id))
  .filter(Boolean);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /* Which mobile submenu is expanded. Both start closed so the seven top-level
     destinations fit one phone screen instead of being buried under 11 sublinks. */
  const [openSection, setOpenSection] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  // const isSpin = location.pathname === '/spin'; // birthday spin campaign disabled
  const { isHome, state: headerState } = useHeaderReveal();
  const { cartCount, wishlistCount, openCart, openWishlist } = useStore();
  const cartCtrls = useAnimationControls();
  const wishCtrls = useAnimationControls();
  const prevCart = useRef(cartCount);
  const prevWish = useRef(wishlistCount);

  useEffect(() => {
    if (cartCount > prevCart.current) {
      cartCtrls.start({ scale: [1, 1.28, 0.92, 1], transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } });
    }
    prevCart.current = cartCount;
  }, [cartCount, cartCtrls]);

  useEffect(() => {
    if (wishlistCount > prevWish.current) {
      wishCtrls.start({ scale: [1, 1.28, 0.92, 1], transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } });
    }
    prevWish.current = wishlistCount;
  }, [wishlistCount, wishCtrls]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setOpenSection(null); // reopen the menu clean rather than mid-browse
  };

  const toggleSection = (id) => setOpenSection((prev) => (prev === id ? null : id));

  /* One row: the label navigates, the chevron reveals that page's sections. */
  const submenuReveal = {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
  };

  const scrollToAboutSection = (sectionId) => {
    // Navigate to about page first
    if (location.pathname !== '/about') {
      navigate('/about');
      // Wait for navigation to complete, then scroll
      setTimeout(() => scrollToId(sectionId), 100);
    } else {
      scrollToId(sectionId);
    }
    setIsMenuOpen(false);
  };

  const handleBuyNow = () => {
    const message = "Hi NutriJewel! I have a question about your products.";
    const whatsappUrl = `https://wa.me/919960637656?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <nav className={`navbar${isHome ? ` navbar--home is-${headerState}` : ` navbar--scroll is-${headerState}`}${isMenuOpen ? ' menu-open' : ''}`}>
      <div className="navbar-container">
        {/* Logo Only */}
        <div className="navbar-brand">
          <Link to="/">
            <img src={`${process.env.PUBLIC_URL}/njlogonav.svg`} alt="NutriJewel Logo" className="navbar-logo-icon" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className="navbar-nav">
          {/* No "Home" link: the logo is the home link, which is universal. */}

          {/* About Dropdown */}
          <li className="navbar-dropdown">
            <Link to="/about" className="navbar-link navbar-dropdown-toggle">
              About <ChevronDown size={16} />
            </Link>
            <div className="navbar-dropdown-menu">
              <Link to="/about" className="navbar-dropdown-link">About NutriJewel</Link>
              <button onClick={() => scrollToAboutSection('aboutpage-story')} className="navbar-dropdown-link">Our Story</button>
              <button onClick={() => scrollToAboutSection('aboutpage-founder')} className="navbar-dropdown-link">Meet Our Founder</button>
              <button onClick={() => scrollToAboutSection('aboutpage-mission')} className="navbar-dropdown-link">Mission & Vision</button>
              <button onClick={() => scrollToAboutSection('aboutpage-values')} className="navbar-dropdown-link">Our Values</button>
              <button onClick={() => scrollToAboutSection('aboutpage-testimonials')} className="navbar-dropdown-link">Customer Reviews</button>
            </div>
          </li>
          
          <li><Link to="/products" className="navbar-link">Products</Link></li>

          {/* Hampers Dropdown */}
          <li className="navbar-dropdown">
            <Link to="/hampers" className="navbar-link navbar-dropdown-toggle">
              Hampers <span className="navbar-new-pill">New</span> <ChevronDown size={16} />
            </Link>
            <div className="navbar-dropdown-menu">
              <Link to="/hampers" className="navbar-dropdown-link">Build your own</Link>
              {NAV_OCCASIONS.map((occasion) => (
                <Link
                  key={occasion.id}
                  to={`/hampers/${occasion.slug}`}
                  className="navbar-dropdown-link"
                >
                  {occasion.emoji} {occasion.name}
                </Link>
              ))}
            </div>
          </li>

          <li><Link to="/services" className="navbar-link">Workshops</Link></li>
          <li><Link to="/recipes-blog" className="navbar-link">Recipes</Link></li>
          <li><Link to="/contact" className="navbar-link">Contact</Link></li>
        </ul>

        {/* Cart + Wishlist */}
        <div className="nj-nav-actions">
          <motion.button className="nj-nav-icon" animate={wishCtrls} onClick={openWishlist} aria-label={`Open wishlist, ${wishlistCount} items`}>
            <Heart size={20} />
            {wishlistCount > 0 && (
              <motion.span className="nj-nav-badge wish" key={wishlistCount}
                initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 18 }}>
                {wishlistCount}
              </motion.span>
            )}
          </motion.button>
          <motion.button className="nj-nav-icon" animate={cartCtrls} onClick={openCart} aria-label={`Open cart, ${cartCount} items`}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <motion.span className="nj-nav-badge" key={cartCount}
                initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 18 }}>
                {cartCount}
              </motion.span>
            )}
          </motion.button>

          {/* Was a wide "Buy Now" button, but it only ever opened a general
              WhatsApp enquiry, competing with the real cart beside it. Now an
              icon that says what it does. */}
          <button
            className="nj-nav-icon nj-nav-whatsapp"
            onClick={handleBuyNow}
            aria-label="Ask us anything on WhatsApp"
            title="Ask us on WhatsApp"
          >
            <MessageCircle size={20} />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="navbar-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - Elegant Hamburger Menu */}
      <div 
        className={`navbar-mobile-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      >
        <div 
          className={`navbar-mobile-menu ${isMenuOpen ? 'active' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* The overlay sits above the navbar (it must, to clear the fixed
              homepage marquee), so the panel carries its own close button. */}
          <div className="navbar-mobile-header">
            <Link to="/" onClick={() => setIsMenuOpen(false)} aria-label="NutriJewel home">
              <img
                src={`${process.env.PUBLIC_URL}/njlogonav.svg`}
                alt="NutriJewel"
                className="navbar-mobile-header-logo"
              />
            </Link>
            <button
              className="navbar-mobile-close"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="navbar-mobile-nav">
            {/* About Section with Submenu */}
            <div className="navbar-mobile-section">
              <div className="navbar-mobile-row">
                <Link
                  to="/about"
                  className="navbar-mobile-link main-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <button
                  className={`navbar-mobile-expand${openSection === 'about' ? ' is-open' : ''}`}
                  onClick={() => toggleSection('about')}
                  aria-expanded={openSection === 'about'}
                  aria-label="Show About sections"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              <AnimatePresence initial={false}>
              {openSection === 'about' && (
              <motion.div className="navbar-mobile-submenu" {...submenuReveal}>
                <button 
                  onClick={() => scrollToAboutSection('aboutpage-story')} 
                  className="navbar-mobile-sublink"
                >
                  Our Story
                </button>
                <button 
                  onClick={() => scrollToAboutSection('aboutpage-founder')} 
                  className="navbar-mobile-sublink"
                >
                  Meet Our Founder
                </button>
                <button 
                  onClick={() => scrollToAboutSection('aboutpage-mission')} 
                  className="navbar-mobile-sublink"
                >
                  Mission & Vision
                </button>
                <button 
                  onClick={() => scrollToAboutSection('aboutpage-values')} 
                  className="navbar-mobile-sublink"
                >
                  Our Values
                </button>
                <button 
                  onClick={() => scrollToAboutSection('aboutpage-testimonials')} 
                  className="navbar-mobile-sublink"
                >
                  Customer Reviews
                </button>
              </motion.div>
              )}
              </AnimatePresence>
            </div>

            <div className="navbar-mobile-section">
              <Link 
                to="/products" 
                className="navbar-mobile-link main-link" 
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
            </div>

            {/* Hampers Section with Submenu */}
            <div className="navbar-mobile-section">
              <div className="navbar-mobile-row">
                <Link
                  to="/hampers"
                  className="navbar-mobile-link main-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hampers <span className="navbar-new-pill">New</span>
                </Link>
                <button
                  className={`navbar-mobile-expand${openSection === 'hampers' ? ' is-open' : ''}`}
                  onClick={() => toggleSection('hampers')}
                  aria-expanded={openSection === 'hampers'}
                  aria-label="Show hamper occasions"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              <AnimatePresence initial={false}>
              {openSection === 'hampers' && (
              <motion.div className="navbar-mobile-submenu" {...submenuReveal}>
                {NAV_OCCASIONS.map((occasion) => (
                  <Link
                    key={occasion.id}
                    to={`/hampers/${occasion.slug}`}
                    className="navbar-mobile-sublink"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {occasion.emoji} {occasion.name}
                  </Link>
                ))}
              </motion.div>
              )}
              </AnimatePresence>
            </div>

            <div className="navbar-mobile-section">
              <Link
                to="/services"
                className="navbar-mobile-link main-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Workshops
              </Link>
            </div>

            <div className="navbar-mobile-section">
              <Link 
                to="/recipes-blog" 
                className="navbar-mobile-link main-link" 
                onClick={() => setIsMenuOpen(false)}
              >
                Recipes
              </Link>
            </div>

            <div className="navbar-mobile-section">
              <Link 
                to="/contact" 
                className="navbar-mobile-link main-link" 
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>

          {/* The menu covers the top bar, so cart and wishlist need a way in
              from here rather than making people close the menu first. */}
          <div className="navbar-mobile-quick">
            <button
              className="navbar-mobile-quick-btn"
              onClick={() => { setIsMenuOpen(false); openCart(); }}
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartCount > 0 && <em>{cartCount}</em>}
            </button>
            <button
              className="navbar-mobile-quick-btn"
              onClick={() => { setIsMenuOpen(false); openWishlist(); }}
            >
              <Heart size={18} />
              <span>Saved</span>
              {wishlistCount > 0 && <em>{wishlistCount}</em>}
            </button>
          </div>

          {/* Was "Buy Now", which only opened a general WhatsApp enquiry. Named
              for what it actually does, matching the desktop header. */}
          <div className="navbar-mobile-cta">
            <button className="navbar-mobile-buy-btn" onClick={handleBuyNow}>
              <MessageCircle size={20} />
              <span>Chat on WhatsApp</span>
            </button>
          </div>

          {/* Mobile Menu Footer */}
          <div className="navbar-mobile-footer">
            <div className="navbar-mobile-footer-tagline">
              <span className="navbar-mobile-footer-lead">Experience</span>
              <span className="navbar-mobile-footer-highlight">Premium Nutrition</span>
            </div>
            <p className="navbar-mobile-footer-subtitle">Clean bites. Big glow.</p>
            <img
              src={`${process.env.PUBLIC_URL}/logo192.png`}
              alt="NutriJewel round logo"
              className="navbar-mobile-footer-logo"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
