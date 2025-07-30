import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `Hi! I'm ${formData.name}. ${formData.message}. You can reach me at ${formData.email} or ${formData.phone}.`;
    const whatsappUrl = `https://wa.me/919960637656?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Number",
      details: ["+91 996-063-7656"],
      action: "tel:+919960637656"
    },
    {
      icon: Mail,
      title: "Email Address",
      details: ["hello@nutrijewel.com"],
      action: "mailto:hello@nutrijewel.com"
    },
    {
      icon: MapPin,
      title: "Office Location",
      details: ["Pune, Maharashtra, India - 412101"],
      action: null
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
      action: null
    }
  ];

  return (
    <div className="contact-page">
      {/* Contact Header */}
      <section className="contact-header">
        <div className="contact-container">
          <h1 className="contact-title">
            Get in <span className="contact-title-green">Touch</span>
          </h1>
          <p className="contact-subtitle">
            Ready to start your healthy snacking journey? We'd love to hear from you! 
            Have questions about our products, ingredients, or want to place a custom order?
          </p>
          <div className="contact-divider"></div>
        </div>
      </section>

      <div className="contact-container">
        <div className="contact-main-grid">
          {/* Contact Information */}
          <div className="contact-info-section">
            <h2 className="section-title">Contact Information</h2>
            <p className="section-description">
              Have questions about our products or services? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>

            <div className="contact-info-grid">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-info-card">
                  <div className="contact-info-icon">
                    <info.icon size={24} />
                  </div>
                  <div className="contact-info-content">
                    <h3>{info.title}</h3>
                    <div className="contact-info-details">
                      {info.details.map((detail, idx) => (
                        <p key={idx}>
                          {info.action ? (
                            <a href={info.action} className="contact-link">
                              {detail}
                            </a>
                          ) : (
                            detail
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="contact-form-wrapper">
              <h2 className="form-title">Send us a Message</h2>
              <p className="form-description">
                Fill out the form below and we'll get back to you within 24 hours
              </p>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="service-booking">Service Booking</option>
                      <option value="nutrition-consultation">Nutrition Consultation</option>
                      <option value="partnership">Partnership/Collaboration</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  <Send size={18} />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="contact-map">
        <div className="contact-container">
          <h2 className="section-title">Visit Our Office</h2>
          <div className="map-wrapper">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.9248342140927!2d73.70549037444943!3d18.662223364833473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b1b83e15d75b%3A0xea8d40feb7493132!2sNutriJewel%20%3A%20Healthy%2C%20Sugar%20Free%2C%20Guilt-Free%2C%20Protein%20Rich%2C%20Snacks%2C%20Granola%2C%20Cookies%2C%20Cakes%2C%20Ladoos%2C%20Desserts%20%26%20more!5e1!3m2!1sen!2sin!4v1753683761274!5m2!1sen!2sin" 
              width="100%" 
              height="450" 
              style={{border: 0, borderRadius: '0.5rem'}} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="NutriJewel Location - Pune, Maharashtra, India - 412101"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq">
        <div className="contact-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How quickly do you respond to inquiries?</h3>
              <p>We typically respond to all inquiries within 24 hours during business days.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer consultation outside business hours?</h3>
              <p>Yes, we can arrange consultations outside regular hours by appointment.</p>
            </div>
            <div className="faq-item">
              <h3>Can I visit your office without an appointment?</h3>
              <p>We recommend scheduling an appointment to ensure we can give you our full attention.</p>
            </div>
            <div className="faq-item">
              <h3>Do you provide online consultations?</h3>
              <p>Yes, we offer both in-person and online nutrition consultations via video calls.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
