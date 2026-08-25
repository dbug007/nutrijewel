import React, { useState } from 'react';
import { Target, Eye, Lightbulb, Globe } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cardVariants, getRevealProps, hoverLift, staggerVariants } from './motionPresets';
import './MissionVision.css';

const CORE_VALUES = [
  { title: 'Innovation',     icon: <Lightbulb size={24} />, description: 'Continuously researching and developing new healthy alternatives that taste amazing.' },
  { title: 'Authenticity',   icon: <Target size={24} />,    description: 'Staying true to traditional recipes while enhancing them with modern nutritional science.' },
  { title: 'Sustainability', icon: <Globe size={24} />,     description: 'Using natural, responsibly sourced ingredients that are good for you and the planet.' },
];

const MissionVision = () => {
  const reduceMotion = useReducedMotion();
  const revealProps = getRevealProps(reduceMotion);
  const [openValue, setOpenValue] = useState(-1);

  const cvPyramidVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.08 } } };
  const cvTierVariants = reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 28, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <motion.section className="mission-vision-section" {...revealProps} variants={cardVariants}>
      <div className="mission-vision-container">
        {/* Section Header */}
        <div className="mission-vision-header">
          <h2 className="mission-vision-title">
            Our Purpose & Dreams
          </h2>
          <div className="mission-vision-divider"></div>
        </div>

        <motion.div className="mission-vision-grid" variants={staggerVariants}>
          {/* Mission */}
          <motion.div className="mission-card" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
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
          </motion.div>

          {/* Vision */}
          <motion.div className="vision-card" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
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
          </motion.div>
        </motion.div>

        {/* Core Values — interactive pyramid */}
        <motion.div className="core-values" variants={cardVariants}>
          <h3 className="core-values-title">Our Core Values</h3>
          <p className="core-values-hint">Hover or tap a value to reveal what it means to us</p>

          <motion.div
            className="cv-pyramid"
            variants={cvPyramidVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
          >
            {CORE_VALUES.map((v, i) => (
              <motion.button
                key={v.title}
                type="button"
                variants={cvTierVariants}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className={`cv-tier cv-tier--${i + 1}${openValue === i ? ' is-open' : ''}`}
                onClick={() => setOpenValue(openValue === i ? -1 : i)}
                aria-expanded={openValue === i}
              >
                <span className="cv-tier-head">
                  <span className="cv-tier-icon">{v.icon}</span>
                  <span className="cv-tier-title">{v.title}</span>
                </span>
                <span className="cv-tier-desc">{v.description}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MissionVision;
