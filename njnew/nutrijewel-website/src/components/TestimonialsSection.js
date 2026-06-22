import React, { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cardVariants, getRevealProps } from './motionPresets';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { websiteTestimonials } from '../data/testimonials';
import './TestimonialsSection.css';

const testimonials = websiteTestimonials;

const TestimonialsSection = () => {
  const reduceMotion = useReducedMotion();
  const revealProps = getRevealProps(reduceMotion);
  const scrollRef = useRef(null);
  useAutoScroll(scrollRef, { interval: 4000 });

  // Rendered twice for a seamless loop (second half is decorative for a11y).
  const loop = [...testimonials, ...testimonials];

  return (
    <motion.section className="testimonials-section" {...revealProps} variants={cardVariants}>
      <div className="testimonials-container">
        {/* Section Header */}
        <div className="testimonials-header">
          <h2 className="testimonials-title">What Our Customers Say</h2>
          <p className="testimonials-subtitle">
            Real stories from real people who've experienced the joy of healthy, delicious snacking
          </p>
          <div className="testimonials-divider"></div>
        </div>

        {/* Auto-scrolling, free-scroll review wall */}
        <div className="testimonials-marquee" ref={scrollRef} aria-label="Customer reviews">
          {loop.map((testimonial, index) => (
            <article
              className="testimonial-card"
              key={index}
              aria-hidden={index >= testimonials.length ? 'true' : undefined}
            >
              <div className="testimonial-content">
                <div className="testimonial-quote-icon">
                  <Quote size={26} className="testimonial-quote-svg" />
                </div>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="testimonial-star" fill="currentColor" />
                  ))}
                </div>
                <blockquote className="testimonial-text">"{testimonial.text}"</blockquote>
                <div className="testimonial-customer">
                  <h4 className="testimonial-customer-name">{testimonial.name}</h4>
                  <p className="testimonial-customer-details">{testimonial.location}</p>
                </div>
              </div>
            </article>
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
