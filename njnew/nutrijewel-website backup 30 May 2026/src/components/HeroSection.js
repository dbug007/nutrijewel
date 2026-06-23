import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Heart, Leaf } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cardVariants, getRevealProps, hoverLift, tapShrink, staggerVariants } from './motionPresets';
import './HeroSection.css';

const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const revealProps = getRevealProps(reduceMotion);
  const heroSlides = useMemo(() => ([
    {
      id: 'hero-founder',
      titleLead: 'Nourish with',
      titleGreen: 'Intention.',
      titleOlive: 'Snack with Joy.',
      description: "Discover India's finest handcrafted, guilt-free sweets and snacks. Made with love, research, and the world's best ingredients for your health and happiness.",
      imageSrc: `${process.env.PUBLIC_URL}/images/ruchika.jpg`,
      imageAlt: 'Dt. Ruchika Bachwani - Registered Pharmacist & Qualified Nutritionist, Founder of NutriJewel',
      imageTitle: 'Handcrafted with Love',
      imageDescription: 'Every product is carefully made by Dt. Ruchika Bachwani - Registered Pharmacist & Qualified Nutritionist with years of nutritional expertise'
    },
    {
      id: 'hero-image',
      titleLead: 'Crafted for',
      titleGreen: 'Everyday Balance.',
      titleOlive: 'Indulgence, Reimagined.',
      description: 'Handcrafted bites, cakes, and snacks made with clean ingredients and mindful sweetness.',
      imageSrc: `${process.env.PUBLIC_URL}/images/ruchikaamritbites.jpg`,
      imageAlt: 'Dt. Ruchika presenting NutriJewel Amrit Bites',
      imageTitle: 'Signature Creations',
      imageDescription: 'Founder-led recipes with thoughtful ingredients and real nourishment.'
    }
  ]), []);
  const [activeSlide, setActiveSlide] = useState(0);
  const currentSlide = heroSlides[activeSlide];
  const slideTransition = reduceMotion ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' };

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    const slideTimer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 7000);

    return () => clearInterval(slideTimer);
  }, [heroSlides.length, reduceMotion]);

  const handleWhatsApp = () => {
    window.open('https://wa.me/919960637656?text=Hi! I\'m interested in NutriJewel products. Can you help me?', '_blank');
  };

  return (
    <motion.section className="hero-section" {...revealProps} variants={cardVariants}>
      {/* Background Pattern */}
      <div className="hero-bg-pattern">
        <div className="hero-bg-circle-1"></div>
        <div className="hero-bg-circle-2"></div>
        <div className="hero-bg-circle-3"></div>
      </div>

      <div className="hero-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            className="hero-grid"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
            transition={slideTransition}
          >
            {/* Left Content */}
            <motion.div className="hero-content" variants={staggerVariants} initial="hidden" animate="visible">
              <motion.div className="hero-text-content" variants={staggerVariants}>
                <h1 className="hero-title">
                  {currentSlide.titleLead}
                  <span className="hero-title-green">{currentSlide.titleGreen}</span>
                  <span className="hero-title-olive">{currentSlide.titleOlive}</span>
                </h1>
                <p className="hero-description">
                  {currentSlide.description}
                </p>
              </motion.div>

              <motion.div className="hero-promises" variants={staggerVariants}>
                <motion.div className="hero-promise-item" variants={cardVariants} whileHover={hoverLift}>
                  <Heart className="hero-promise-icon" size={20} />
                  <span className="hero-promise-text">100% Natural</span>
                </motion.div>
                <motion.div className="hero-promise-item" variants={cardVariants} whileHover={hoverLift}>
                  <img 
                    src={`${process.env.PUBLIC_URL}/images/sugar-free-icon.svg`}
                    alt="Refined Sugar Free" 
                    className="hero-promise-icon custom-sugar-icon" 
                    width={20} 
                    height={20}
                  />
                  <span className="hero-promise-text">Refined Sugar Free</span>
                </motion.div>
                <motion.div className="hero-promise-item" variants={cardVariants} whileHover={hoverLift}>
                  <Leaf className="hero-promise-icon" size={20} />
                  <span className="hero-promise-text">Preservative Free</span>
                </motion.div>
              </motion.div>

              {/* CTA Buttons */}
              <div className="hero-cta-container">
                <motion.button 
                  onClick={handleWhatsApp}
                  className="hero-btn-primary"
                  whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={tapShrink}
                >
                  <span>Order Now</span>
                  <ChevronRight size={20} />
                </motion.button>
                <motion.button 
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hero-btn-secondary"
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={tapShrink}
                >
                  Explore Products
                </motion.button>
              </div>

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
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div className="hero-image-container" variants={cardVariants} initial="hidden" animate="visible">
              <motion.div className="hero-image-wrapper" variants={cardVariants} whileHover={reduceMotion ? undefined : hoverLift}>
                <motion.div className="hero-image-card" whileHover={reduceMotion ? undefined : { scale: 1.01 }}>
                  <div className="hero-image-background">
                    <img 
                      src={currentSlide.imageSrc}
                      alt={currentSlide.imageAlt}
                      className="hero-image-bg"
                    />
                  </div>
                  <div className="hero-image-overlay">
                    <div className="hero-image-content">
                      <h3 className="hero-image-title">
                        {currentSlide.imageTitle}
                      </h3>
                      <p className="hero-image-description">
                        {currentSlide.imageDescription}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Floating Elements */}
              <div className="hero-floating-1"></div>
              <div className="hero-floating-2"></div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="hero-slider-controls" role="tablist" aria-label="Hero slides">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-slider-dot ${index === activeSlide ? 'is-active' : ''}`}
              aria-label={`Show slide ${index + 1}`}
              aria-pressed={index === activeSlide}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
