import React from 'react';
import { Calendar, Users, BookOpen, MessageCircle, Clock, Award, CheckCircle } from 'lucide-react';
import './ServicesPage.css';

const ServicesPage = () => {
  const services = [
    {
      id: 1,
      category: "Workshops",
      title: "Healthy Cooking Workshop",
      description: "Learn to prepare nutritious meals that are both delicious and healthy. Perfect for families wanting to improve their eating habits.",
      duration: "3 hours",
      groupSize: "8-12 people",
      price: "₹2,999",
      features: [
        "Hands-on cooking experience",
        "Recipe booklet included",
        "Nutritional guidance",
        "Take-home samples"
      ],
      image: "/images/workshop1.jpg"
    },
    {
      id: 2,
      category: "Workshops",
      title: "Kids Nutrition Workshop",
      description: "Special workshop designed for parents to learn about child nutrition and create healthy meal plans for growing kids.",
      duration: "2.5 hours",
      groupSize: "6-10 parents",
      price: "₹2,499",
      features: [
        "Age-specific nutrition tips",
        "Kid-friendly recipes",
        "Meal planning strategies",
        "Interactive activities"
      ],
      image: "/images/workshop2.jpg"
    },
    {
      id: 3,
      category: "Sessions",
      title: "Personal Nutrition Consultation",
      description: "One-on-one session with our expert nutritionist to create a personalized diet plan based on your health goals and lifestyle.",
      duration: "60 minutes",
      groupSize: "1-on-1",
      price: "₹1,999",
      features: [
        "Detailed health assessment",
        "Customized meal plan",
        "Supplement recommendations",
        "Follow-up support"
      ],
      image: "/images/consultation1.jpg"
    },
    {
      id: 4,
      category: "Sessions",
      title: "Family Nutrition Planning",
      description: "Comprehensive nutrition planning for the entire family, taking into account different age groups and dietary preferences.",
      duration: "90 minutes",
      groupSize: "Family (up to 4)",
      price: "₹3,499",
      features: [
        "Family meal planning",
        "Budget-friendly options",
        "Special dietary needs",
        "Shopping guidelines"
      ],
      image: "/images/consultation2.jpg"
    },
    {
      id: 5,
      category: "Consultancy",
      title: "Corporate Wellness Program",
      description: "Comprehensive wellness program for corporate teams focusing on nutrition education and healthy workplace habits.",
      duration: "Half day",
      groupSize: "20-50 employees",
      price: "₹15,999",
      features: [
        "Nutrition seminars",
        "Healthy snack options",
        "Wellness assessment",
        "Ongoing support"
      ],
      image: "/images/corporate1.jpg"
    },
    {
      id: 6,
      category: "Consultancy",
      title: "Restaurant Menu Consultation",
      description: "Professional consultation for restaurants wanting to add healthy, nutritious options to their menu while maintaining taste.",
      duration: "2-3 days",
      groupSize: "Restaurant team",
      price: "₹25,999",
      features: [
        "Menu analysis",
        "Healthy recipe development",
        "Staff training",
        "Marketing support"
      ],
      image: "/images/restaurant1.jpg"
    }
  ];

  const [selectedCategory, setSelectedCategory] = React.useState("All Services");
  const categories = ["All Services", "Workshops", "Sessions", "Consultancy"];

  const filteredServices = selectedCategory === "All Services" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const handleBookService = (serviceName) => {
    const message = `Hi! I'm interested in booking "${serviceName}". Can you provide more details and check availability?`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGeneralInquiry = () => {
    const message = "Hi! I'd like to know more about your nutrition services. Can you help me choose the right option for my needs?";
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="services-page">
      {/* Header Section */}
      <section className="services-header">
        <div className="services-container">
          <h1 className="services-title">
            Our <span className="services-title-green">Professional Services</span>
          </h1>
          <p className="services-subtitle">
            Expert nutrition guidance through personalized consultations, interactive workshops, and comprehensive consultancy services
          </p>
          <div className="services-divider"></div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="services-why-choose">
        <div className="services-container">
          <h2 className="section-title">Why Choose Our Services?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Award className="feature-icon" size={32} />
              <h3>Certified Nutritionist</h3>
              <p>Led by Dt. Ruchika Bachwani with years of professional experience</p>
            </div>
            <div className="feature-card">
              <Users className="feature-icon" size={32} />
              <h3>Personalized Approach</h3>
              <p>Tailored solutions based on your individual needs and lifestyle</p>
            </div>
            <div className="feature-card">
              <Clock className="feature-icon" size={32} />
              <h3>Flexible Scheduling</h3>
              <p>Convenient timing options to fit your busy schedule</p>
            </div>
            <div className="feature-card">
              <MessageCircle className="feature-icon" size={32} />
              <h3>Ongoing Support</h3>
              <p>Continuous guidance and support throughout your health journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="services-categories">
        <div className="services-container">
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-grid-section">
        <div className="services-container">
          <div className="services-grid">
            {filteredServices.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <div className="service-category-tag">{service.category}</div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </div>

                <div className="service-details">
                  <div className="service-info">
                    <div className="info-item">
                      <Clock size={16} />
                      <span>Duration: {service.duration}</span>
                    </div>
                    <div className="info-item">
                      <Users size={16} />
                      <span>Group Size: {service.groupSize}</span>
                    </div>
                  </div>

                  <div className="service-features">
                    <h4>What's Included:</h4>
                    <ul>
                      {service.features.map((feature, index) => (
                        <li key={index}>
                          <CheckCircle size={16} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="service-pricing">
                    <div className="service-price">{service.price}</div>
                    <button 
                      className="service-book-btn"
                      onClick={() => handleBookService(service.title)}
                    >
                      <Calendar size={18} />
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="services-process">
        <div className="services-container">
          <h2 className="section-title">How It Works</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Book Consultation</h3>
                <p>Choose your preferred service and book a consultation</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Assessment</h3>
                <p>We assess your needs, goals, and current lifestyle</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Customized Plan</h3>
                <p>Receive a personalized nutrition plan tailored for you</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Ongoing Support</h3>
                <p>Get continuous guidance and adjust plans as needed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="services-cta">
        <div className="services-container">
          <div className="cta-content">
            <h2>Ready to Start Your Health Journey?</h2>
            <p>Let's discuss your nutrition goals and find the perfect service for you</p>
            <div className="cta-buttons">
              <button 
                className="cta-btn primary"
                onClick={handleGeneralInquiry}
              >
                <MessageCircle size={18} />
                Get Free Consultation
              </button>
              <button 
                className="cta-btn secondary"
                onClick={() => handleBookService("general service inquiry")}
              >
                <BookOpen size={18} />
                View All Services
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
