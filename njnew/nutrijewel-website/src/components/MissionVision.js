import React from 'react';
import { Target, Eye, Lightbulb, Globe } from 'lucide-react';
import './MissionVision.css';

const MissionVision = () => {
  return (
    <section className="mission-vision-section">
      <div className="mission-vision-container">
        {/* Section Header */}
        <div className="mission-vision-header">
          <h2 className="mission-vision-title">
            Our Purpose & Dreams
          </h2>
          <div className="mission-vision-divider"></div>
        </div>

        <div className="mission-vision-grid">
          {/* Mission */}
          <div className="mission-card">
            <div className="card-header">
              <div className="mission-icon-wrapper">
                <Target size={32} className="card-icon" />
              </div>
              <h3 className="card-title">Our Mission</h3>
            </div>
            
            <p className="card-description">
              To provide clean, handcrafted, nutritious snacks that promote health and happiness 
              without compromising on taste. We are committed to creating guilt-free alternatives 
              that nourish both body and soul.
            </p>

            <div className="card-features">
              <div className="card-feature">
                <div className="mission-bullet"></div>
                <span className="feature-text">Handcrafted with premium ingredients</span>
              </div>
              <div className="card-feature">
                <div className="mission-bullet"></div>
                <span className="feature-text">No artificial preservatives or additives</span>
              </div>
              <div className="card-feature">
                <div className="mission-bullet"></div>
                <span className="feature-text">Nutritious alternatives to traditional sweets</span>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="vision-card">
            <div className="card-header">
              <div className="vision-icon-wrapper">
                <Eye size={32} className="card-icon" />
              </div>
              <h3 className="card-title">Our Vision</h3>
            </div>
            
            <p className="card-description">
              To become the most trusted brand for guilt-free, artisanal snacks that nourish both 
              body and soul. We envision a world where healthy eating is joyful and accessible to everyone.
            </p>

            <div className="card-features">
              <div className="card-feature">
                <div className="vision-bullet"></div>
                <span className="feature-text">Leading brand in healthy snacking</span>
              </div>
              <div className="card-feature">
                <div className="vision-bullet"></div>
                <span className="feature-text">Making healthy eating joyful and accessible</span>
              </div>
              <div className="card-feature">
                <div className="vision-bullet"></div>
                <span className="feature-text">Inspiring healthier lifestyle choices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="core-values">
          <h3 className="core-values-title">
            Our Core Values
          </h3>
          
          <div className="core-values-grid">
            <div className="value-item">
              <div className="value-icon-wrapper">
                <Lightbulb size={36} className="value-icon" />
              </div>
              <h4 className="value-title">Innovation</h4>
              <p className="value-description">
                Continuously researching and developing new healthy alternatives that taste amazing
              </p>
            </div>
            
            <div className="value-item">
              <div className="value-icon-wrapper">
                <Target size={36} className="value-icon" />
              </div>
              <h4 className="value-title">Authenticity</h4>
              <p className="value-description">
                Staying true to traditional recipes while enhancing them with modern nutritional science
              </p>
            </div>
            
            <div className="value-item">
              <div className="value-icon-wrapper">
                <Globe size={36} className="value-icon" />
              </div>
              <h4 className="value-title">Sustainability</h4>
              <p className="value-description">
                Using natural, responsibly sourced ingredients that are good for you and the planet
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
