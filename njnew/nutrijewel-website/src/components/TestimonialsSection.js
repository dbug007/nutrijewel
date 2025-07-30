import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import './TestimonialsSection.css';

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Pune, Maharashtra, India - 412101",
    rating: 5,
    text: "NutriJewel's Bliss Bites are my go-to pre-workout snack! They're delicious, guilt-free, and give me the perfect energy boost. Finally found healthy sweets that actually taste amazing!",
    product: "Bliss Bites"
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    location: "Pune, Maharashtra, India - 412101",
    rating: 5,
    text: "The Cambridge Cake was a hit at my daughter's birthday! No one could believe it was refined sugar free and healthy. Dt. Ruchika Bachwani has truly created magic with these recipes.",
    product: "Cambridge Cake"
  },
  {
    id: 3,
    name: "Anjali Patel",
    location: "Pune, Maharashtra, India - 412101",
    rating: 5,
    text: "As a new mother, the Amrit Bites have been a blessing. They're traditional, nutritious, and help with my recovery. The taste reminds me of my grandmother's cooking!",
    product: "Amrit Bites"
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Pune, Maharashtra, India - 412101",
    rating: 5,
    text: "I'm diabetic and thought I'd never enjoy sweets again. NutriJewel changed that! The Ragi Sattva is now my favorite treat, and my sugar levels remain stable.",
    product: "Ragi Sattva"
  },
  {
    id: 5,
    name: "Meera Joshi",
    location: "Pune, Maharashtra, India - 412101",
    rating: 5,
    text: "The granola is absolutely divine! I start every morning with it, and it keeps me energized throughout the day. The cinnamon and dark chocolate combination is perfect.",
    product: "NJ Granola"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
    <section className="testimonials-section">
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
          <div className="testimonial-card">
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
                  {testimonials[currentIndex].location} • Loved: {testimonials[currentIndex].product}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="testimonial-nav-btn testimonial-nav-prev"
          >
            <ChevronLeft size={24} className="testimonial-nav-icon" />
          </button>
          
          <button
            onClick={goToNext}
            className="testimonial-nav-btn testimonial-nav-next"
          >
            <ChevronRight size={24} className="testimonial-nav-icon" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`testimonial-dot ${
                index === currentIndex ? 'testimonial-dot-active' : ''
              }`}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="testimonial-stats">
          <div className="testimonial-stat">
            <div className="testimonial-stat-number">500+</div>
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
    </section>
  );
};

export default TestimonialsSection;
