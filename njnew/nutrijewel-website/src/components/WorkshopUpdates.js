import React from 'react';
import { Users, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  cardVariants,
  staggerVariants,
  listItemVariants,
  getRevealProps
} from './motionPresets';
import './WorkshopUpdates.css';

const WorkshopUpdates = () => {
  const reduceMotion = useReducedMotion();
  const revealProps = getRevealProps(reduceMotion);
  const pastWorkshops = [
    {
      id: 1,
      title: 'Summer Camp for Students',
      audience: 'School students',
      format: 'In-person · Pune',
      description: 'A hands-on summer program teaching students healthy eating habits, balanced snacking, and the joy of nutritious food.',
      highlights: ['Interactive sessions', 'Healthy snack making', 'Fun nutrition games', 'Takeaway recipes']
    },
    {
      id: 2,
      title: 'Corporate Nutrition Session',
      audience: 'Corporate teams',
      format: 'On-site & online',
      description: 'An interactive wellness session for corporate teams on mindful eating, sustained energy, and healthier workday routines.',
      highlights: ['Workplace wellness', 'Energy & focus tips', 'Live Q&A', 'Practical meal ideas']
    },
    {
      id: 3,
      title: 'University Students Nutrition & Diet Session',
      audience: 'University students',
      format: 'Campus session',
      description: 'A university-led session guiding students through balanced diets, smart food choices, and sustainable healthy habits.',
      highlights: ['Balanced diet basics', 'Smart campus eating', 'Myth-busting', 'Personalized tips']
    }
  ];

  const handleNotify = () => {
    const message = "Hi! I'd love to be notified about NutriJewel's upcoming workshops. Please keep me posted!";
    window.open(`https://wa.me/919960637656?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="workshops" className="workshops-section">
      <div className="workshops-container">
        {/* Section Header */}
        <div className="workshops-header">
          <h2 className="workshops-title">
            Workshops We've Hosted
          </h2>
          <p className="workshops-subtitle">
            A look at the hands-on sessions led by Ruchika Bachwani, Registered Pharmacist & Qualified Nutritionist. New workshops are on the way, stay tuned!
          </p>
          <div className="workshops-divider"></div>
        </div>

        {/* Workshops Grid */}
        <motion.div
          className="workshops-grid"
          variants={staggerVariants}
          {...revealProps}
        >
          {pastWorkshops.map((workshop) => (
            <motion.div key={workshop.id} className="workshop-card" variants={cardVariants}>
              {/* Workshop Header */}
              <div className="workshop-header">
                <motion.div className="workshop-badge workshop-badge--past" variants={listItemVariants}>Completed</motion.div>
                <h3 className="workshop-title">{workshop.title}</h3>
                <p className="workshop-description">{workshop.description}</p>
              </div>

              {/* Workshop Details */}
              <div className="workshop-details">
                <div className="workshop-detail-item">
                  <Users className="workshop-detail-icon" size={18} />
                  <span>{workshop.audience}</span>
                </div>
                <div className="workshop-detail-item">
                  <MapPin className="workshop-detail-icon" size={18} />
                  <span>{workshop.format}</span>
                </div>
              </div>

              {/* Workshop Highlights */}
              <div className="workshop-highlights">
                <h4 className="highlights-title">What we covered:</h4>
                <motion.ul className="highlights-list" variants={staggerVariants}>
                  {workshop.highlights.map((highlight, index) => (
                    <motion.li key={index} className="highlight-item" variants={listItemVariants}>
                      ✨ {highlight}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <div className="workshops-cta">
          <div className="cta-content">
            <h3 className="cta-title">🔔 More workshops coming soon</h3>
            <p className="cta-description">
              New sessions are being planned. Get notified about upcoming workshop announcements and early access.
            </p>
            <button
              onClick={handleNotify}
              className="cta-notify-btn"
            >
              Notify Me About Upcoming Workshops
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkshopUpdates;
