import React from 'react';
import { Award, Users, Leaf, Heart } from 'lucide-react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        {/* Header */}
        <div className="about-header">
          <h2>
            Meet the Heart Behind 
            <span className="about-header-green">NutriJewel</span>
          </h2>
          <div className="about-divider"></div>
        </div>

        {/* Main Content Grid - Image and Text at same height */}
        <div className="about-main-grid">
          {/* Left - Founder Photo */}
          <div className="about-image-section">
            <div className="about-founder-wrapper">
              <div className="about-founder-card">
                <div className="about-founder-background">
                  <img 
                    src="/images/ruchikaamritbites.jpeg" 
                    alt="Dt. Ruchika Bachwani - Founder of NutriJewel"
                    className="about-founder-bg"
                  />
                </div>
                <div className="about-founder-overlay">
                  <div className="about-founder-content">
                    <div className="about-founder-info">
                      <h3 className="about-founder-name">
                        Dt. Ruchika Bachwani
                      </h3>
                      <p className="about-founder-title">Founder & Nutritionist</p>
                      <p className="about-founder-quote">
                        "Every product tells a story of health, happiness, and handcrafted excellence"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Story Content */}
          <div className="about-story-section">
            <div className="about-text">
              <p className="about-text-large">
                Founded by <span className="about-founder-name-text">Dt. Ruchika Bachwani</span>, 
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
            <div className="about-stats">
              <div className="about-stat-item">
                <div className="about-stat-number">100%</div>
                <div className="about-stat-label">Natural Ingredients</div>
              </div>
              <div className="about-stat-item">
                <div className="about-stat-number">0</div>
                <div className="about-stat-label">Artificial Preservatives</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid - Below main content */}
        <div className="about-values-section">
          <div className="about-values">
            <div className="about-value-card">
              <Award className="about-value-icon" size={32} />
              <h4 className="about-value-title">Quality First</h4>
              <p className="about-value-description">Premium ingredients sourced with care</p>
            </div>
            
            <div className="about-value-card">
              <Leaf className="about-value-icon" size={32} />
              <h4 className="about-value-title">Clean Eating</h4>
              <p className="about-value-description">No refined sugars or artificial additives</p>
            </div>
            
            <div className="about-value-card">
              <Heart className="about-value-icon" size={32} />
              <h4 className="about-value-title">Made with Love</h4>
              <p className="about-value-description">Handcrafted in small batches</p>
            </div>
            
            <div className="about-value-card">
              <Users className="about-value-icon" size={32} />
              <h4 className="about-value-title">Family First</h4>
              <p className="about-value-description">Safe for the whole family</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
