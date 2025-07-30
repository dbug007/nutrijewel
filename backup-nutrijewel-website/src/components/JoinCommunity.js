import React from 'react';
import { MessageCircle, Users, Gift, Heart } from 'lucide-react';
import './JoinCommunity.css';

const JoinCommunity = () => {
  const handleWhatsAppGroup = () => {
    // Replace with actual WhatsApp group link
    window.open('https://chat.whatsapp.com/nutrijewel-community', '_blank');
  };

  const communityBenefits = [
    {
      icon: <Gift size={24} />,
      title: 'Exclusive Offers',
      description: 'Get first access to new products and special discounts'
    },
    {
      icon: <MessageCircle size={24} />,
      title: 'Recipe Sharing',
      description: 'Share and discover healthy recipes with fellow food lovers'
    },
    {
      icon: <Users size={24} />,
      title: 'Health Tips',
      description: 'Daily nutrition tips and wellness advice from Dt. Ruchika'
    },
    {
      icon: <Heart size={24} />,
      title: 'Community Support',
      description: 'Connect with like-minded people on your health journey'
    }
  ];

  return (
    <section id="community" className="community-section">
      <div className="community-container">
        {/* Background Pattern */}
        <div className="community-bg-pattern">
          <div className="community-circle-1"></div>
          <div className="community-circle-2"></div>
          <div className="community-circle-3"></div>
        </div>

        <div className="community-content">
          {/* Left Content */}
          <div className="community-text">
            <h2 className="community-title">
              Join the NutriJewel 
              <span className="community-title-highlight">Community</span>
            </h2>
            <p className="community-description">
              Be part of our growing family of health-conscious food lovers! Connect with fellow 
              wellness enthusiasts, get exclusive recipes, and stay updated with the latest from NutriJewel.
            </p>

            {/* Benefits Grid */}
            <div className="community-benefits">
              {communityBenefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <div className="benefit-icon">
                    {benefit.icon}
                  </div>
                  <div className="benefit-content">
                    <h4 className="benefit-title">{benefit.title}</h4>
                    <p className="benefit-description">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Join Button */}
            <div className="community-cta">
              <button 
                onClick={handleWhatsAppGroup}
                className="join-community-btn"
              >
                <MessageCircle size={20} />
                <span>Join WhatsApp Community</span>
              </button>
              <p className="community-note">
                🌟 Over 1000+ members already sharing their wellness journey!
              </p>
            </div>
          </div>

          {/* Right Visual */}
          <div className="community-visual">
            <div className="community-card">
              <div className="community-card-header">
                <div className="community-avatar-group">
                  <div className="community-avatar">👩‍🍳</div>
                  <div className="community-avatar">👨‍💼</div>
                  <div className="community-avatar">👩‍💻</div>
                  <div className="community-avatar">👨‍🎓</div>
                </div>
                <div className="community-info">
                  <h3 className="community-card-title">NutriJewel Family</h3>
                  <p className="community-card-subtitle">1000+ Happy Members</p>
                </div>
              </div>
              
              <div className="community-card-content">
                <div className="community-message">
                  <div className="message-bubble">
                    <p>"Just tried the Bliss Bites recipe - amazing! 😍"</p>
                    <span className="message-time">2 min ago</span>
                  </div>
                </div>
                
                <div className="community-message">
                  <div className="message-bubble">
                    <p>"Thank you for the healthy lifestyle tips! 🙏"</p>
                    <span className="message-time">5 min ago</span>
                  </div>
                </div>
                
                <div className="community-message">
                  <div className="message-bubble">
                    <p>"Can't wait for the next workshop! 🎉"</p>
                    <span className="message-time">10 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunity;
