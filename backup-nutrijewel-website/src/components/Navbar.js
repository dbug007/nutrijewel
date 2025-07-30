import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAboutDropdown = () => {
    setIsAboutDropdownOpen(!isAboutDropdownOpen);
  };

  const scrollToSection = (sectionId) => {
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
    setIsAboutDropdownOpen(false);
  };

  const handleBuyNow = () => {
    const message = "Hi! I'm interested in NutriJewel products. Can you help me with the latest offerings?";
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Only */}
        <div className="navbar-brand">
          <Link to="/">
            <img src={`${process.env.PUBLIC_URL}/njlogonav.svg`} alt="NutriJewel Logo" className="navbar-logo-icon" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className="navbar-nav">
          <li><Link to="/" className="navbar-link">Home</Link></li>
          
          {/* About Dropdown */}
          <li className="navbar-dropdown">
            <button 
              className="navbar-link navbar-dropdown-toggle"
              onClick={toggleAboutDropdown}
            >
              About <ChevronDown size={16} />
            </button>
            {isAboutDropdownOpen && (
              <div className="navbar-dropdown-menu">
                <button onClick={() => scrollToSection('about')} className="navbar-dropdown-link">About NJ</button>
                <button onClick={() => scrollToSection('mission')} className="navbar-dropdown-link">Mission & Vision</button>
                <button onClick={() => scrollToSection('testimonials')} className="navbar-dropdown-link">Reviews</button>
              </div>
            )}
          </li>
          
          <li><Link to="/products" className="navbar-link">Products</Link></li>
          <li><Link to="/services" className="navbar-link">Services</Link></li>
          <li><Link to="/recipes-blog" className="navbar-link">Recipes & Blog</Link></li>
          <li><Link to="/contact" className="navbar-link">Contact</Link></li>
        </ul>

        {/* Buy Now Button */}
        <button className="navbar-buy-btn" onClick={handleBuyNow}>
          <ShoppingBag size={18} />
          Buy Now
        </button>

        {/* Mobile Menu Toggle */}
        <button 
          className="navbar-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="navbar-mobile">
          <ul className="navbar-mobile-nav">
            <li><Link to="/" className="navbar-mobile-link" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            
            {/* About Section */}
            <li><button onClick={() => scrollToSection('about')} className="navbar-mobile-link">About NJ</button></li>
            <li><button onClick={() => scrollToSection('mission')} className="navbar-mobile-link">Mission & Vision</button></li>
            <li><button onClick={() => scrollToSection('testimonials')} className="navbar-mobile-link">Reviews</button></li>
            
            <li><Link to="/products" className="navbar-mobile-link" onClick={() => setIsMenuOpen(false)}>Products</Link></li>
            <li><Link to="/services" className="navbar-mobile-link" onClick={() => setIsMenuOpen(false)}>Services</Link></li>
            <li><Link to="/recipes-blog" className="navbar-mobile-link" onClick={() => setIsMenuOpen(false)}>Recipes & Blog</Link></li>
            <li><Link to="/contact" className="navbar-mobile-link" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
            <li>
              <button className="navbar-mobile-buy-btn" onClick={handleBuyNow}>
                <ShoppingBag size={18} />
                Buy Now
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
