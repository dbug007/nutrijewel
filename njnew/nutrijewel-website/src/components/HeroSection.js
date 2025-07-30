import React from 'react';
import { ChevronRight, Heart, Leaf } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  const handleWhatsApp = () => {
    window.open('https://wa.me/919960637656?text=Hi! I\'m interested in NutriJewel products. Can you help me?', '_blank');
  };

  return (
    <section className="hero-section">
      {/* Background Pattern */}
      <div className="hero-bg-pattern">
        <div className="hero-bg-circle-1"></div>
        <div className="hero-bg-circle-2"></div>
        <div className="hero-bg-circle-3"></div>
      </div>

      <div className="hero-container">
        <div className="hero-grid">
          {/* Left Content */}
          <div className="hero-content">
            <div className="hero-text-content">
              <h1 className="hero-title">
                Nourish with
                <span className="hero-title-green">Intention.</span>
                <span className="hero-title-olive">Snack with Joy.</span>
              </h1>
              <p className="hero-description">
                Discover India's finest handcrafted, guilt-free sweets and snacks. 
                Made with love, research, and the world's best ingredients for your health and happiness.
              </p>
            </div>

            {/* Health Promises */}
            <div className="hero-promises">
              <div className="hero-promise-item">
                <Heart className="hero-promise-icon" size={20} />
                <span className="hero-promise-text">100% Natural</span>
              </div>
              <div className="hero-promise-item">
                <img 
                  src={`${process.env.PUBLIC_URL}/images/sugar-free-icon.svg`}
                  alt="Refined Sugar Free" 
                  className="hero-promise-icon custom-sugar-icon" 
                  width={20} 
                  height={20}
                />
                <span className="hero-promise-text">Refined Sugar Free</span>
              </div>
              <div className="hero-promise-item">
                <Leaf className="hero-promise-icon" size={20} />
                <span className="hero-promise-text">Preservative Free</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hero-cta-container">
              <button 
                onClick={handleWhatsApp}
                className="hero-btn-primary"
              >
                <span>Order Now</span>
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="hero-btn-secondary"
              >
                Explore Products
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="hero-trust-indicators">
              <div className="hero-trust-item">
                <div className="hero-trust-number">16+</div>
                <div className="hero-trust-label">Premium Products</div>
              </div>
              <div className="hero-trust-item">
                <div className="hero-trust-number">100%</div>
                <div className="hero-trust-label">Handcrafted</div>
              </div>
              <div className="hero-trust-item">
                <div className="hero-trust-number">FSSAI</div>
                <div className="hero-trust-label">Certified</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="hero-image-container">
            <div className="hero-image-wrapper">
              <div className="hero-image-card">
                <div className="hero-image-background">
                  <img 
                    src={`${process.env.PUBLIC_URL}/images/ruchika.jpeg`}
                    alt="Dt. Ruchika Bachwani - Certified Pharmacist, Dietitian & Nutritionist, Founder of NutriJewel"
                    className="hero-image-bg"
                  />
                </div>
                <div className="hero-image-overlay">
                  <div className="hero-image-content">
                    <h3 className="hero-image-title">
                      Handcrafted with Love
                    </h3>
                    <p className="hero-image-description">
                      Every product is carefully made by Dt. Ruchika Bachwani - Certified Pharmacist, Dietitian & Nutritionist with years of nutritional expertise
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="hero-floating-1"></div>
            <div className="hero-floating-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
