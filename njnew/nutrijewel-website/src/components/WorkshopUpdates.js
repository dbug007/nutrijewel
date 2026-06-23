import React from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import './WorkshopUpdates.css';

const WorkshopUpdates = () => {
  const upcomingWorkshops = [
    {
      id: 1,
      title: 'Healthy Sweets Making Workshop',
      date: '2025-08-15',
      time: '10:00 AM - 2:00 PM',
      location: 'NutriJewel Kitchen Studio, Pune, Maharashtra, India - 412101',
      participants: 12,
      maxParticipants: 15,
      price: '₹2,500',
      description: 'Learn to make guilt-free traditional sweets with modern nutritional science.',
      highlights: ['Hands-on cooking', 'Take home samples', 'Recipe booklet', 'Certificate']
    },
    {
      id: 2,
      title: 'Nutrition & Wellness Masterclass',
      date: '2025-08-22',
      time: '6:00 PM - 8:00 PM',
      location: 'Online via Zoom',
      participants: 45,
      maxParticipants: 50,
      price: '₹1,200',
      description: 'Comprehensive guide to clean eating and healthy lifestyle choices.',
      highlights: ['Expert guidance', 'Q&A session', 'Diet charts', 'Follow-up support']
    },
    {
      id: 3,
      title: 'Kids Healthy Snacks Workshop',
      date: '2025-08-29',
      time: '11:00 AM - 1:00 PM',
      location: 'NutriJewel Kitchen Studio, Pune, Maharashtra, India - 412101',
      participants: 8,
      maxParticipants: 12,
      price: '₹1,800',
      description: 'Fun workshop for parents to learn making nutritious snacks kids will love.',
      highlights: ['Kid-friendly recipes', 'Parent-child activity', 'Lunch included', 'Recipe cards']
    }
  ];

  const handleWorkshopRegistration = (workshopTitle) => {
    const message = `Hi! I'm interested in registering for the "${workshopTitle}" workshop. Could you please provide more details?`;
    window.open(`https://wa.me/919960637656?text=${encodeURIComponent(message)}`, '_blank');
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <section id="workshops" className="workshops-section">
      <div className="workshops-container">
        {/* Section Header */}
        <div className="workshops-header">
          <h2 className="workshops-title">
            Workshops
          </h2>
          <p className="workshops-subtitle">
            Join Dt. Ruchika Bachwani - Registered Pharmacist & Qualified Nutritionist for hands-on learning experiences in healthy cooking and nutrition
          </p>
          <div className="workshops-divider"></div>
        </div>

        {/* Workshops Grid */}
        <div className="workshops-grid">
          {upcomingWorkshops.map((workshop) => (
            <div key={workshop.id} className="workshop-card">
              {/* Workshop Header */}
              <div className="workshop-header">
                <div className="workshop-badge">
                  {workshop.participants < workshop.maxParticipants ? 'Open' : 'Full'}
                </div>
                <h3 className="workshop-title">{workshop.title}</h3>
                <p className="workshop-description">{workshop.description}</p>
              </div>

              {/* Workshop Details */}
              <div className="workshop-details">
                <div className="workshop-detail-item">
                  <Calendar className="workshop-detail-icon" size={18} />
                  <span>{formatDate(workshop.date)}</span>
                </div>
                
                <div className="workshop-detail-item">
                  <Clock className="workshop-detail-icon" size={18} />
                  <span>{workshop.time}</span>
                </div>
                
                <div className="workshop-detail-item">
                  <MapPin className="workshop-detail-icon" size={18} />
                  <span>{workshop.location}</span>
                </div>
                
                <div className="workshop-detail-item">
                  <Users className="workshop-detail-icon" size={18} />
                  <span>{workshop.participants}/{workshop.maxParticipants} participants</span>
                </div>
              </div>

              {/* Workshop Highlights */}
              <div className="workshop-highlights">
                <h4 className="highlights-title">What you'll get:</h4>
                <ul className="highlights-list">
                  {workshop.highlights.map((highlight, index) => (
                    <li key={index} className="highlight-item">
                      ✨ {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Workshop Footer */}
              <div className="workshop-footer">
                <div className="workshop-price">
                  <span className="price-label">Investment:</span>
                  <span className="price-amount">{workshop.price}</span>
                </div>
                
                <button 
                  onClick={() => handleWorkshopRegistration(workshop.title)}
                  className={`workshop-register-btn ${workshop.participants >= workshop.maxParticipants ? 'disabled' : ''}`}
                  disabled={workshop.participants >= workshop.maxParticipants}
                >
                  <span>{workshop.participants >= workshop.maxParticipants ? 'Fully Booked' : 'Register Now'}</span>
                  {workshop.participants < workshop.maxParticipants && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="workshops-cta">
          <div className="cta-content">
            <h3 className="cta-title">Can't find a suitable time?</h3>
            <p className="cta-description">
              Get notified about new workshops and exclusive early-bird offers
            </p>
            <button 
              onClick={() => handleWorkshopRegistration('future workshops notification')}
              className="cta-notify-btn"
            >
              Notify Me About Future Workshops
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkshopUpdates;
