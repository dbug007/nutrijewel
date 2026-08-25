import React from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  // "Get in Touch" was repeating on every page. Show it only on the homepage;
  // every other page relies on the dedicated Contact page, the nav Contact link,
  // and the footer's Contact column.
  const showContactSection = location.pathname === '/';

  const handleWhatsApp = () => {
    const message = "Hi! I'm interested in NutriJewel products. Can you help me?";
    const whatsappUrl = `https://wa.me/919960637656?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Contact Section - homepage only (avoids repeating "Get in Touch" everywhere) */}
      {showContactSection && (
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

                <div className="contact-cta">
                  <p className="contact-cta-text">
                    Prefer to chat? Place your order and get instant answers on WhatsApp.
                  </p>
                  <button className="whatsapp-btn" onClick={handleWhatsApp}>
                    <MessageCircle size={20} />
                    <span>Order on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Contact Form — removed per request; {false &&} guard keeps the markup for easy re-enable */}
              {false && (
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
              )}
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
                  Made to order with love, served with care.
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
                <li><a href="/contact#faq" className="footer-link">FAQs</a></li>
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
              <h3 className="footer-title">Contact</h3>
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
