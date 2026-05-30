import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cardVariants, getRevealProps, hoverLift, tapShrink } from './motionPresets';
import { websiteTestimonials } from '../data/testimonials';
import './TestimonialsSection.css';

const testimonials = websiteTestimonials;

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const reduceMotion = useReducedMotion();
  const revealProps = getRevealProps(reduceMotion);

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <motion.section className="testimonials-section" {...revealProps} variants={cardVariants}>
      <div className="testimonials-container">
        {/* Section Header */}
        <div className="testimonials-header">
          <h2 className="testimonials-title">
            What Our Customers Say
          </h2>
          <p className="testimonials-subtitle">
            Real stories from real people who've experienced the joy of healthy, delicious snacking
          </p>
          <div className="testimonials-divider"></div>
        </div>

        {/* Testimonial Slider */}
        <div className="testimonials-carousel">
          <motion.div className="testimonial-card" key={currentIndex} variants={cardVariants} initial={false} animate="visible" whileHover={reduceMotion ? undefined : hoverLift}>
            <div className="testimonial-content">
              {/* Quote Icon */}
              <div className="testimonial-quote-icon">
                <Quote size={32} className="testimonial-quote-svg" />
              </div>

              {/* Rating */}
              <div className="testimonial-rating">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} size={20} className="testimonial-star" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="testimonial-text">
                "{testimonials[currentIndex].text}"
              </blockquote>

              {/* Customer Info */}
              <div className="testimonial-customer">
                <h4 className="testimonial-customer-name">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="testimonial-customer-details">
                  {testimonials[currentIndex].location}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Navigation Arrows */}
          <motion.button
            onClick={goToPrevious}
            className="testimonial-nav-btn testimonial-nav-prev"
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            whileTap={tapShrink}
          >
            <ChevronLeft size={24} className="testimonial-nav-icon" />
          </motion.button>
          
          <motion.button
            onClick={goToNext}
            className="testimonial-nav-btn testimonial-nav-next"
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            whileTap={tapShrink}
          >
            <ChevronRight size={24} className="testimonial-nav-icon" />
          </motion.button>
        </div>

        {/* Dots Indicator */}
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`testimonial-dot ${
                index === currentIndex ? 'testimonial-dot-active' : ''
              }`}
              whileHover={reduceMotion ? undefined : { scale: 1.18 }}
              whileTap={tapShrink}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="testimonial-stats">
          <div className="testimonial-stat">
              <div className="testimonial-stat-number">1000+</div>
            <div className="testimonial-stat-label">Happy Customers</div>
          </div>
          <div className="testimonial-stat">
            <div className="testimonial-stat-number">5.0★</div>
            <div className="testimonial-stat-label">Average Rating</div>
          </div>
          <div className="testimonial-stat">
            <div className="testimonial-stat-number">100%</div>
            <div className="testimonial-stat-label">Natural Products</div>
          </div>
          <div className="testimonial-stat">
            <div className="testimonial-stat-number">24h</div>
            <div className="testimonial-stat-label">Fresh Guarantee</div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;
