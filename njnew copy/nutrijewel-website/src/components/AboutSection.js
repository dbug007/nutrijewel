import React from 'react';
import { Award, Users, Leaf, Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cardVariants, getRevealProps, hoverLift, staggerVariants } from './motionPresets';
import './AboutSection.css';

const AboutSection = () => {
  const reduceMotion = useReducedMotion();
  const revealProps = getRevealProps(reduceMotion);

  return (
    <motion.section id="about" className="home-about-section" {...revealProps} variants={cardVariants}>
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
          <motion.div className="home-about-image-section" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
            <motion.div className="home-about-founder-wrapper" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
              <motion.div className="home-about-founder-card" whileHover={reduceMotion ? undefined : { scale: 1.01 }}>
                <div className="home-about-founder-background">
                  <img 
                    src="/images/ruchikaamritbites.jpg" 
                    alt="Dt. Ruchika Bachwani - Registered Pharmacist & Qualified Nutritionist, Founder of NutriJewel"
                    className="home-about-founder-bg"
                  />
                </div>
                <div className="home-about-founder-overlay">
                  <div className="home-about-founder-content">
                    <div className="home-about-founder-info">
                      <h3 className="home-about-founder-name">
                        Dt. Ruchika Bachwani
                      </h3>
                      <p className="home-about-founder-title">Registered Pharmacist & Qualified Nutritionist</p>
                      <p className="home-about-founder-quote">
                        "Every product tells a story of health, happiness, and handcrafted excellence"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right - Story Content */}
          <motion.div className="home-about-story-section" variants={staggerVariants}>
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
              <motion.div className="home-about-stat-item" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
                <div className="home-about-stat-number">100%</div>
                <div className="home-about-stat-label">Natural Ingredients</div>
              </motion.div>
              <motion.div className="home-about-stat-item" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
                <div className="home-about-stat-number">0</div>
                <div className="home-about-stat-label">Artificial Preservatives</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Values Grid - Below main content */}
        <div className="home-about-values-section">
          <div className="home-about-values">
            <motion.div className="home-about-value-card" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
              <Award className="home-about-value-icon" size={32} />
              <h4 className="home-about-value-title">Quality First</h4>
              <p className="home-about-value-description">Premium ingredients sourced with care</p>
            </motion.div>
            
            <motion.div className="home-about-value-card" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
              <Leaf className="home-about-value-icon" size={32} />
              <h4 className="home-about-value-title">Clean Eating</h4>
              <p className="home-about-value-description">No refined sugars or artificial additives</p>
            </motion.div>
            
            <motion.div className="home-about-value-card" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
              <Heart className="home-about-value-icon" size={32} />
              <h4 className="home-about-value-title">Made with Love</h4>
              <p className="home-about-value-description">Handcrafted in small batches</p>
            </motion.div>
            
            <motion.div className="home-about-value-card" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
              <Users className="home-about-value-icon" size={32} />
              <h4 className="home-about-value-title">Family First</h4>
              <p className="home-about-value-description">Safe for the whole family</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutSection;
