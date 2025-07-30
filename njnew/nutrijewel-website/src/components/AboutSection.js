import React from 'react';
import { Award, Users, Leaf, Heart } from 'lucide-react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section id="about" className="home-about-section">
      <div className="home-about-container">
        {/* Header */}
        <div className="home-about-header">
          <h2>
            Meet the Heart Behind <span className="home-about-header-green">NutriJewel</span>
          </h2>
          <div className="home-about-divider"></div>
        </div>

        {/* Main Content Grid - Image and Text at same height */}
        <div className="home-about-main-grid">
          {/* Left - Founder Photo */}
          <div className="home-about-image-section">
            <div className="home-about-founder-wrapper">
              <div className="home-about-founder-card">
                <div className="home-about-founder-background">
                  <img 
                    src="/images/ruchikaamritbites.jpeg" 
                    alt="Dt. Ruchika Bachwani - Certified Pharmacist, Dietitian & Nutritionist, Founder of NutriJewel"
                    className="home-about-founder-bg"
                  />
                </div>
                <div className="home-about-founder-overlay">
                  <div className="home-about-founder-content">
                    <div className="home-about-founder-info">
                      <h3 className="home-about-founder-name">
                        Dt. Ruchika Bachwani
                      </h3>
                      <p className="home-about-founder-title">Certified Pharmacist, Dietitian & Nutritionist</p>
                      <p className="home-about-founder-quote">
                        "Every product tells a story of health, happiness, and handcrafted excellence"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Story Content */}
          <div className="home-about-story-section">
            <div className="home-about-text">
              <p className="home-about-text-large">
                Founded by <span className="home-about-founder-name-text">Dt. Ruchika Bachwani</span>, 
                NutriJewel was born from a passion to create guilt-free alternatives to traditional sweets and snacks 
                without compromising on taste or nutrition.
              </p>
              
              <p>
                With years of expertise in nutrition and a deep understanding of clean eating principles, 
                every NutriJewel product is carefully researched, handcrafted, and made with the finest 
                natural ingredients. We believe that healthy eating should be joyful, not restrictive.
              </p>

              <p>
                Our artisanal approach ensures that each product is made in small batches with love, 
                maintaining the highest quality standards while preserving the authentic flavors you crave.
              </p>
            </div>

            {/* Stats */}
            <div className="home-about-stats">
              <div className="home-about-stat-item">
                <div className="home-about-stat-number">100%</div>
                <div className="home-about-stat-label">Natural Ingredients</div>
              </div>
              <div className="home-about-stat-item">
                <div className="home-about-stat-number">0</div>
                <div className="home-about-stat-label">Artificial Preservatives</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid - Below main content */}
        <div className="home-about-values-section">
          <div className="home-about-values">
            <div className="home-about-value-card">
              <Award className="home-about-value-icon" size={32} />
              <h4 className="home-about-value-title">Quality First</h4>
              <p className="home-about-value-description">Premium ingredients sourced with care</p>
            </div>
            
            <div className="home-about-value-card">
              <Leaf className="home-about-value-icon" size={32} />
              <h4 className="home-about-value-title">Clean Eating</h4>
              <p className="home-about-value-description">No refined sugars or artificial additives</p>
            </div>
            
            <div className="home-about-value-card">
              <Heart className="home-about-value-icon" size={32} />
              <h4 className="home-about-value-title">Made with Love</h4>
              <p className="home-about-value-description">Handcrafted in small batches</p>
            </div>
            
            <div className="home-about-value-card">
              <Users className="home-about-value-icon" size={32} />
              <h4 className="home-about-value-title">Family First</h4>
              <p className="home-about-value-description">Safe for the whole family</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
