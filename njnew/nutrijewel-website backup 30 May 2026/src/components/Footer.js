import React from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const isContactPage = location.pathname === '/contact';

  const handleWhatsApp = () => {
    const message = "Hi! I'm interested in NutriJewel products. Can you help me?";
    const whatsappUrl = `https://wa.me/919960637656?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Contact Section - Show on all pages except Contact page */}
      {!isContactPage && (
        <section id="contact" className="contact-section">
          <div className="contact-container">
            <div className="contact-header">
              <h2 className="contact-title">Get in Touch</h2>
              <p className="contact-subtitle">
                Ready to start your healthy snacking journey? We'd love to hear from you!
              </p>
              <div className="contact-divider"></div>
            </div>

            <div className="contact-grid">
              {/* Contact Info */}
              <div className="contact-info">
                <div className="contact-section-header">
                  <h3 className="contact-section-title">Let's Connect</h3>
                  <p className="contact-description">
                    Have questions about our products, ingredients, or want to place a custom order? 
                    We're here to help you make the best choice for your healthy lifestyle.
                  </p>
                </div>

                <div className="contact-items">
                  <div className="contact-item">
                    <div className="contact-icon">
                      <Phone size={20} />
                    </div>
                    <div className="contact-details">
                      <h4 className="contact-detail-title">Phone / WhatsApp</h4>
                      <p className="contact-detail-text">+91 996-063-7656</p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="contact-icon">
                      <Mail size={20} />
                    </div>
                    <div className="contact-details">
                      <h4 className="contact-detail-title">Email</h4>
                      <p className="contact-detail-text">hello@nutrijewel.com</p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="contact-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="contact-details">
                      <h4 className="contact-detail-title">Location</h4>
                      <p className="contact-detail-text">Pune, Maharashtra, India - 412101</p>
                    </div>
                  </div>
                </div>

                <button className="whatsapp-btn" onClick={handleWhatsApp}>
                  Order on WhatsApp
                </button>
              </div>

              {/* Contact Form */}
              <div className="contact-form-container">
                <form className="contact-form">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Your Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      className="form-input"
                      placeholder="Enter your full name"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      className="form-input"
                      placeholder="your.email@example.com"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      className="form-input"
                      placeholder="+91 12345 67890"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows="4" 
                      className="form-textarea"
                      placeholder="Tell us about your requirements..."
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="form-submit-btn">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* Brand Section */}
            <div className="footer-section">
              <div className="footer-brand">
                <div className="footer-logo-section">
                  <img src={`${process.env.PUBLIC_URL}/njlogo.svg?v=20260412`} alt="NutriJewel Logo" className="footer-logo" />
                </div>
                <p className="footer-description">
                  Crafting healthy, delicious snacks that nourish your body and delight your taste buds. 
                  Made with love, served with care.
                </p>
                <div className="social-links">
                <a href="https://instagram.com/nutrijewel" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <Instagram size={20} />
                </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#home" className="footer-link">Home</a></li>
                <li><a href="#about" className="footer-link">About Us</a></li>
                <li><a href="#products" className="footer-link">Products</a></li>
                <li><a href="#mission" className="footer-link">Our Mission</a></li>
                <li><a href="#testimonials" className="footer-link">Reviews</a></li>
                <li><a href="#contact" className="footer-link">Contact</a></li>
              </ul>
            </div>

            {/* Products */}
            <div className="footer-section">
              <h3 className="footer-title">Our Products</h3>
              <ul className="footer-links">
                <li><a href="/products" className="footer-link">Healthy Cakes</a></li>
                <li><a href="/products" className="footer-link">Bliss Bites</a></li>
                <li><a href="/products" className="footer-link">Nutri Bars</a></li>
                <li><a href="/products" className="footer-link">Granola Mix</a></li>
                <li><a href="/products" className="footer-link">Ragi Ladoo</a></li>
                <li><a href="/products" className="footer-link">Healthy Chivda</a></li>
              </ul>
            </div>

            {/* Legal & Policies */}
            <div className="footer-section">
              <h3 className="footer-title">Legal</h3>
              <ul className="footer-links">
                <li><a href="/terms-and-conditions" className="footer-link">Terms & Conditions</a></li>
                <li><a href="/privacy-policy" className="footer-link">Privacy Policy</a></li>
                <li><a href="/refund-policy" className="footer-link">Refund Policy</a></li>
                <li><a href="/shipping-policy" className="footer-link">Shipping Policy</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h3 className="footer-title">Get in Touch</h3>
              <div className="footer-contact">
                <div className="footer-contact-item">
                  <Phone size={16} />
                  <span>+91 996-063-7656</span>
                </div>
                <div className="footer-contact-item">
                  <Mail size={16} />
                  <span>hello@nutrijewel.com</span>
                </div>
                <div className="footer-contact-item">
                  <MapPin size={16} />
                  <span>Pune, Maharashtra, India - 412101</span>
                </div>
              </div>
              <button className="footer-whatsapp-btn" onClick={handleWhatsApp}>
                Order Now
              </button>
            </div>
          </div>

          <div className="footer-divider"></div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 NutriJewel. All rights reserved. Made with ❤️ in India.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
