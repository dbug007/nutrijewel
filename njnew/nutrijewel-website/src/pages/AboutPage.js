import React from 'react';
import { Award, Users, Leaf, Heart, Star, Coffee, BookOpen, Sparkles, Quote, Shield, Target, CheckCircle, Clock, Globe } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Pune, Maharashtra, India",
      rating: 5,
      text: "NutriJewel's Bliss Bites are my go-to pre-workout snack! They're delicious, guilt-free, and give me the perfect energy boost. Finally found healthy sweets that actually taste amazing!",
      product: "Bliss Bites"
    },
    {
      id: 2,
      name: "Rajesh Kumar", 
      location: "Pune, Maharashtra, India",
      rating: 5,
      text: "The Cambridge Cake was a hit at my daughter's birthday! No one could believe it was refined sugar free and healthy. Dt. Ruchika Bachwani has truly created magic with these recipes.",
      product: "Cambridge Cake"
    },
    {
      id: 3,
      name: "Anjali Patel",
      location: "Pune, Maharashtra, India", 
      rating: 5,
      text: "As a new mother, the Amrit Bites have been a blessing. They're traditional, nutritious, and help with my recovery. The taste reminds me of my grandmother's cooking!",
      product: "Amrit Bites"
    },
    {
      id: 4,
      name: "Vikram Singh",
      location: "Pune, Maharashtra, India",
      rating: 5, 
      text: "I'm diabetic and thought I'd never enjoy sweets again. NutriJewel changed that! The Ragi Sattva is now my favorite treat, and my sugar levels remain stable.",
      product: "Ragi Sattva"
    },
    {
      id: 5,
      name: "Meera Joshi",
      location: "Pune, Maharashtra, India",
      rating: 5,
      text: "The granola is absolutely divine! I start every morning with it, and it keeps me energized throughout the day. The cinnamon and dark chocolate combination is perfect.",
      product: "NJ Granola"
    }
  ];

  return (
    <div className="aboutpage-wrapper">
      {/* Hero Section */}
      <section className="aboutpage-hero">
        {/* Floating Particles - Enhanced Ingredient Collection */}
        <div className="aboutpage-particles">
          {/* Nuts */}
          <div className="particle particle-almond particle-1"></div>
          <div className="particle particle-cashew particle-2"></div>
          <div className="particle particle-pistachio particle-3"></div>
          
          {/* Seeds */}
          <div className="particle particle-chia particle-4"></div>
          <div className="particle particle-pumpkin-seed particle-5"></div>
          <div className="particle particle-seed particle-6"></div>
          
          {/* Fruits & Berries */}
          <div className="particle particle-strawberry particle-7"></div>
          <div className="particle particle-date particle-8"></div>
          <div className="particle particle-berry particle-9"></div>
          
          {/* Chocolate & Special */}
          <div className="particle particle-chocolate particle-10"></div>
          <div className="particle particle-sparkle particle-11"></div>
          
          {/* Leaves & Natural */}
          <div className="particle particle-leaf particle-12"></div>
          <div className="particle particle-mint-leaf particle-13"></div>
          
          {/* More variety */}
          <div className="particle particle-almond particle-14"></div>
          <div className="particle particle-cashew particle-15"></div>
          <div className="particle particle-chocolate particle-16"></div>
          <div className="particle particle-strawberry particle-17"></div>
          <div className="particle particle-chia particle-18"></div>
        </div>
        
        <div className="aboutpage-container">
          <div className="aboutpage-hero-content">
            <div className="aboutpage-hero-badge">
              <Sparkles size={16} />
              <span>Crafted with Love & Nutrition</span>
            </div>
            <h1 className="aboutpage-hero-title">
              The Story Behind <span className="aboutpage-text-green">NutriJewel</span>
            </h1>
            <p className="aboutpage-hero-subtitle">
              Discover how passion for nutrition meets artisanal craftsmanship to create 
              guilt-free indulgences that nourish your body and delight your taste buds.
            </p>
            <div className="aboutpage-hero-stats">
              <div className="aboutpage-hero-stat-plain">
                <span className="aboutpage-stat-number">100%</span>
                <span className="aboutpage-stat-label">Natural</span>
              </div>
              <div className="aboutpage-hero-stat-plain">
                <span className="aboutpage-stat-number">0</span>
                <span className="aboutpage-stat-label">Preservatives</span>
              </div>
              <div className="aboutpage-hero-stat-plain">
                <span className="aboutpage-stat-number">5★</span>
                <span className="aboutpage-stat-label">Customer Love</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="aboutpage-story" className="aboutpage-story">
        <div className="aboutpage-container">
          <div className="aboutpage-section-header">
            <div className="aboutpage-section-badge">
              <BookOpen size={16} />
              <span>Our Journey</span>
            </div>
            <h2 className="aboutpage-section-title">Our Story</h2>
            <p className="aboutpage-section-subtitle">
              From a passion for nutrition to creating India's finest healthy indulgences
            </p>
          </div>

          <div className="aboutpage-story-content">
            <div className="aboutpage-story-timeline">
              <div className="aboutpage-timeline-item">
                <div className="aboutpage-timeline-marker">
                  <BookOpen size={20} />
                </div>
                <div className="aboutpage-timeline-content">
                  <h3 className="aboutpage-timeline-title">The Beginning</h3>
                  <p className="aboutpage-timeline-text">
                    It all started in a small kitchen in Pune, where Dt. Ruchika Bachwani, 
                    a certified pharmacist and nutritionist, was experimenting with healthy 
                    alternatives to traditional Indian sweets. As a healthcare professional, 
                    she witnessed firsthand how sugar-laden treats were affecting her clients' 
                    health goals.
                  </p>
                </div>
              </div>

              <div className="aboutpage-timeline-item">
                <div className="aboutpage-timeline-marker">
                  <Heart size={20} />
                </div>
                <div className="aboutpage-timeline-content">
                  <h3 className="aboutpage-timeline-title">The Inspiration</h3>
                  <p className="aboutpage-timeline-text">
                    The turning point came when her young daughter asked, "Mama, why can't 
                    healthy food taste as good as sweets?" This innocent question sparked 
                    a mission to create treats that were both nutritious and delicious - 
                    proving that healthy eating doesn't mean giving up on taste.
                  </p>
                </div>
              </div>

              <div className="aboutpage-timeline-item">
                <div className="aboutpage-timeline-marker">
                  <Sparkles size={20} />
                </div>
                <div className="aboutpage-timeline-content">
                  <h3 className="aboutpage-timeline-title">The Innovation</h3>
                  <p className="aboutpage-timeline-text">
                    Combining her pharmaceutical knowledge with nutritional expertise, 
                    Ruchika spent months perfecting recipes that used natural sweeteners, 
                    ancient grains, and superfoods. Each recipe was meticulously tested 
                    for taste, nutrition, and shelf-life - creating what would become 
                    NutriJewel's signature products.
                  </p>
                </div>
              </div>

              <div className="aboutpage-timeline-item">
                <div className="aboutpage-timeline-marker">
                  <Globe size={20} />
                </div>
                <div className="aboutpage-timeline-content">
                  <h3 className="aboutpage-timeline-title">The Growth</h3>
                  <p className="aboutpage-timeline-text">
                    What started as a personal mission soon became a movement. Friends and 
                    family couldn't stop raving about these healthy treats. Word spread, 
                    and NutriJewel was born - not just as a brand, but as a promise to 
                    make healthy eating accessible, enjoyable, and sustainable for everyone.
                  </p>
                </div>
              </div>

              <div className="aboutpage-timeline-item">
                <div className="aboutpage-timeline-marker">
                  <Award size={20} />
                </div>
                <div className="aboutpage-timeline-content">
                  <h3 className="aboutpage-timeline-title">Today & Beyond</h3>
                  <p className="aboutpage-timeline-text">
                    Today, NutriJewel continues to innovate, creating artisanal healthy 
                    treats that don't compromise on taste or nutrition. Every product 
                    tells a story of dedication, quality, and the belief that everyone 
                    deserves to enjoy guilt-free indulgence. Our journey continues as 
                    we expand our family of health-conscious food lovers across India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section id="aboutpage-founder" className="aboutpage-founder">
        <div className="aboutpage-container">
          <div className="aboutpage-founder-grid">
            <div className="aboutpage-founder-image">
              <div className="aboutpage-image-frame">
                <img 
                  src="/images/ruchikaamritbites.jpeg" 
                  alt="Dt. Ruchika Bachwani - Founder of NutriJewel"
                  className="aboutpage-founder-photo"
                />
                <div className="aboutpage-image-overlay">
                  <div className="aboutpage-credentials">
                    <div className="aboutpage-credential">
                      <Shield size={16} />
                      <span>Certified Pharmacist</span>
                    </div>
                    <div className="aboutpage-credential">
                      <Award size={16} />
                      <span>Licensed Dietitian</span>
                    </div>
                    <div className="aboutpage-credential">
                      <Heart size={16} />
                      <span>Nutrition Expert</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="aboutpage-founder-content">
              <div className="aboutpage-section-badge">
                <Coffee size={16} />
                <span>Meet Our Founder</span>
              </div>
              
              <h2 className="aboutpage-founder-name">Dt. Ruchika Bachwani</h2>
              <p className="aboutpage-founder-title">
                Certified Pharmacist, Dietitian & Nutritionist
              </p>
              
              <div className="aboutpage-founder-quote">
                <Quote size={24} className="aboutpage-quote-icon" />
                <blockquote>
                  "My journey began with a simple belief: healthy food should never 
                  compromise on taste. Every NutriJewel product is a testament to this 
                  philosophy, crafted with precision, love, and years of nutritional expertise."
                </blockquote>
              </div>

              <div className="aboutpage-founder-story">
                <p>
                  With over a decade of experience in nutrition science and pharmacy, 
                  Dt. Ruchika combines traditional wisdom with modern nutritional research 
                  to create products that truly nourish.
                </p>
                <p>
                  Her vision for NutriJewel stems from witnessing countless clients struggle 
                  with restrictive diets that left them craving satisfaction. She set out 
                  to prove that healthy eating can be both indulgent and beneficial.
                </p>
              </div>

              <div className="aboutpage-achievements">
                <div className="aboutpage-achievement">
                  <CheckCircle size={20} />
                  <span>10+ Years Experience</span>
                </div>
                <div className="aboutpage-achievement">
                  <CheckCircle size={20} />
                  <span>500+ Happy Customers</span>
                </div>
                <div className="aboutpage-achievement">
                  <CheckCircle size={20} />
                  <span>Research-Based Recipes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="aboutpage-mission" className="aboutpage-mission">
        <div className="aboutpage-container">
          <div className="aboutpage-section-header">
            <div className="aboutpage-section-badge">
              <Target size={16} />
              <span>Our Purpose</span>
            </div>
            <h2 className="aboutpage-section-title">Mission & Vision</h2>
            <p className="aboutpage-section-subtitle">
              Driving change in how the world thinks about healthy indulgence
            </p>
          </div>

          <div className="aboutpage-mission-grid">
            <div className="aboutpage-mission-card">
              <div className="aboutpage-card-icon">
                <Heart size={32} />
              </div>
              <h3 className="aboutpage-card-title">Our Mission</h3>
              <p className="aboutpage-card-content">
                To revolutionize healthy eating by creating artisanal, nutrient-dense 
                alternatives to traditional sweets and snacks that don't compromise on 
                taste, quality, or satisfaction.
              </p>
            </div>

            <div className="aboutpage-mission-card">
              <div className="aboutpage-card-icon">
                <Globe size={32} />
              </div>
              <h3 className="aboutpage-card-title">Our Vision</h3>
              <p className="aboutpage-card-content">
                To become the most trusted name in healthy indulgence, inspiring 
                families worldwide to embrace clean eating without sacrificing the 
                joy of delicious, satisfying treats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="aboutpage-values" className="aboutpage-values">
        <div className="aboutpage-container">
          <div className="aboutpage-section-header">
            <div className="aboutpage-section-badge">
              <Sparkles size={16} />
              <span>What Drives Us</span>
            </div>
            <h2 className="aboutpage-section-title">Our Core Values</h2>
            <p className="aboutpage-section-subtitle">
              The principles that guide every decision we make
            </p>
          </div>

          <div className="aboutpage-values-grid">
            <div className="aboutpage-value-card">
              <div className="aboutpage-value-icon">
                <Award size={28} />
              </div>
              <h4 className="aboutpage-value-title">Quality First</h4>
              <p className="aboutpage-value-description">
                Premium ingredients sourced with care, tested for purity, 
                and crafted to perfection in every batch.
              </p>
            </div>

            <div className="aboutpage-value-card">
              <div className="aboutpage-value-icon">
                <Leaf size={28} />
              </div>
              <h4 className="aboutpage-value-title">Clean Ingredients</h4>
              <p className="aboutpage-value-description">
                No refined sugars, artificial preservatives, or chemical 
                additives. Just pure, natural goodness.
              </p>
            </div>

            <div className="aboutpage-value-card">
              <div className="aboutpage-value-icon">
                <Heart size={28} />
              </div>
              <h4 className="aboutpage-value-title">Made with Love</h4>
              <p className="aboutpage-value-description">
                Every product is handcrafted in small batches with 
                attention to detail and genuine care.
              </p>
            </div>

            <div className="aboutpage-value-card">
              <div className="aboutpage-value-icon">
                <Users size={28} />
              </div>
              <h4 className="aboutpage-value-title">Family Safe</h4>
              <p className="aboutpage-value-description">
                Safe and nutritious for the whole family, from children 
                to grandparents, with options for every dietary need.
              </p>
            </div>

            <div className="aboutpage-value-card">
              <div className="aboutpage-value-icon">
                <BookOpen size={28} />
              </div>
              <h4 className="aboutpage-value-title">Science-Based</h4>
              <p className="aboutpage-value-description">
                Every recipe is backed by nutritional research and 
                years of expertise in dietetics and wellness.
              </p>
            </div>

            <div className="aboutpage-value-card">
              <div className="aboutpage-value-icon">
                <Clock size={28} />
              </div>
              <h4 className="aboutpage-value-title">Timeless Recipes</h4>
              <p className="aboutpage-value-description">
                Honoring traditional flavors while innovating for 
                modern health-conscious lifestyles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="aboutpage-testimonials" className="aboutpage-testimonials">
        <div className="aboutpage-container">
          <div className="aboutpage-section-header">
            <div className="aboutpage-section-badge">
              <Star size={16} />
              <span>Customer Love</span>
            </div>
            <h2 className="aboutpage-section-title">What Our Customers Say</h2>
            <p className="aboutpage-section-subtitle">
              Real stories from families who've embraced the NutriJewel lifestyle
            </p>
          </div>

          <div className="aboutpage-testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="aboutpage-testimonial-card">
                <div className="aboutpage-testimonial-header">
                  <div className="aboutpage-stars">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="aboutpage-star-filled" />
                    ))}
                  </div>
                  <div className="aboutpage-testimonial-product">
                    {testimonial.product}
                  </div>
                </div>
                
                <p className="aboutpage-testimonial-text">"{testimonial.text}"</p>
                
                <div className="aboutpage-testimonial-author">
                  <div className="aboutpage-author-info">
                    <h5 className="aboutpage-author-name">{testimonial.name}</h5>
                    <p className="aboutpage-author-location">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="aboutpage-stats">
        <div className="aboutpage-container">
          <div className="aboutpage-stats-grid">
            <div className="aboutpage-stat-card">
              <div className="aboutpage-stat-number">500+</div>
              <div className="aboutpage-stat-label">Happy Customers</div>
              <div className="aboutpage-stat-description">Families trust our products</div>
            </div>
            
            <div className="aboutpage-stat-card">
              <div className="aboutpage-stat-number">15+</div>
              <div className="aboutpage-stat-label">Unique Products</div>
              <div className="aboutpage-stat-description">Carefully crafted recipes</div>
            </div>
            
            <div className="aboutpage-stat-card">
              <div className="aboutpage-stat-number">100%</div>
              <div className="aboutpage-stat-label">Natural Ingredients</div>
              <div className="aboutpage-stat-description">No artificial additives</div>
            </div>
            
            <div className="aboutpage-stat-card">
              <div className="aboutpage-stat-number">10+</div>
              <div className="aboutpage-stat-label">Years Experience</div>
              <div className="aboutpage-stat-description">In nutrition science</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="aboutpage-cta">
        <div className="aboutpage-container">
          <div className="aboutpage-cta-content">
            <h2 className="aboutpage-cta-title">
              Ready to Start Your Healthy Journey?
            </h2>
            <p className="aboutpage-cta-text">
              Join hundreds of families who've discovered that healthy can be delicious. 
              Explore our range of artisanal, nutritious treats made with love and expertise.
            </p>
            <div className="aboutpage-cta-buttons">
              <a href="/products" className="aboutpage-btn-primary">
                <Coffee size={20} />
                <span>Explore Products</span>
              </a>
              <a href="/contact" className="aboutpage-btn-secondary">
                <Heart size={20} />
                <span>Get in Touch</span>
              </a>
            </div>
            
            <div className="aboutpage-cta-signature">
              <p>With love and nutrition,</p>
              <p className="aboutpage-signature-name">Dt. Ruchika Bachwani</p>
              <p className="aboutpage-signature-title">Founder, NutriJewel</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
