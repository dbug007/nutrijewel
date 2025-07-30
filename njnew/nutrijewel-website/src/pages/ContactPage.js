/*
 * ContactPage Component - Version 2.0
 * 
 * Version 2.0 Features:
 * - Enhanced desktop layout alignment and responsiveness
 * - Optimized contact information and form grid balance
 * - Improved visual hierarchy and professional styling
 * - Better form field spacing and user experience
 * - WhatsApp integration for contact form submissions
 * - Comprehensive validation and error handling
 * - Updated: July 30, 2025
 */

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import './ContactPage.css';

const ContactPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Form status state
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    isSubmitted: false,
    error: null
  });

  // Form validation state
  const [errors, setErrors] = useState({});

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone.trim() && !/^[+]?[\d\s-()]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Subject validation
    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setFormStatus({
      isSubmitting: true,
      isSubmitted: false,
      error: null
    });

    try {
      // Format WhatsApp message
      const whatsappMessage = `
*New Contact Form Submission*

*Name:* ${formData.name}
*Email:* ${formData.email}
*Phone:* ${formData.phone || 'Not provided'}
*Subject:* ${formData.subject}

*Message:*
${formData.message}
      `.trim();

      const whatsappURL = `https://wa.me/919960637656?text=${encodeURIComponent(whatsappMessage)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappURL, '_blank');

      // Simulate successful submission
      setTimeout(() => {
        setFormStatus({
          isSubmitting: false,
          isSubmitted: true,
          error: null
        });

        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });

        // Hide success message after 5 seconds
        setTimeout(() => {
          setFormStatus(prev => ({
            ...prev,
            isSubmitted: false
          }));
        }, 5000);
      }, 1000);

    } catch (error) {
      setFormStatus({
        isSubmitting: false,
        isSubmitted: false,
        error: 'Failed to send message. Please try again or contact us directly.'
      });
    }
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
      details: ["Mon - Sat: 9:00 AM - 7:00 PM", "Sunday: 10:00 AM - 4:00 PM"],
      action: null
    }
  ];

  return (
    <div className="contact-page">
      {/* Header Section */}
      <section className="contact-page-header">
        <div className="contact-page-container">
          <h1 className="contact-page-title">
            Get in <span className="contact-page-title-green">Touch</span>
          </h1>
          <p className="contact-page-subtitle">
            Ready to start your healthy snacking journey? We'd love to hear from you! 
            Have questions about our products, ingredients, or want to place a custom order?
          </p>
          <div className="contact-page-divider"></div>
        </div>
      </section>

      <div className="contact-page-container">
        <div className="contact-page-main-grid">
          {/* Contact Information */}
          <div className="contact-page-info-section">
            <h2 className="section-title">Contact Information</h2>
            <p className="section-description">
              Have questions about our products or services? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>

            <div className="contact-page-info-grid">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-page-info-card">
                  <div className="contact-page-info-icon">
                    <info.icon size={24} />
                  </div>
                  <div className="contact-page-info-content">
                    <h3>{info.title}</h3>
                    <div className="contact-page-info-details">
                      {info.details.map((detail, idx) => (
                        <p key={idx}>
                          {info.action ? (
                            <a href={info.action} className="contact-page-link">
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
          <div className="contact-page-form-section">
            <div className="contact-page-form-wrapper">
              <h2 className="form-title">Send us a Message</h2>
              <p className="form-description">
                Fill out the form below and we'll get back to you within 24 hours
              </p>

              {/* Success Message */}
              {formStatus.isSubmitted && (
                <div className="form-success-message">
                  <CheckCircle size={20} />
                  <span>Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}

              {/* Error Message */}
              {formStatus.error && (
                <div className="form-error-message">
                  <AlertCircle size={20} />
                  <span>{formStatus.error}</span>
                </div>
              )}

              <form className="contact-page-form" onSubmit={handleSubmit}>
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
                      className={errors.name ? 'error' : ''}
                      disabled={formStatus.isSubmitting}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
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
                      className={errors.email ? 'error' : ''}
                      disabled={formStatus.isSubmitting}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
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
                      className={errors.phone ? 'error' : ''}
                      disabled={formStatus.isSubmitting}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className={errors.subject ? 'error' : ''}
                      disabled={formStatus.isSubmitting}
                    >
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="service-booking">Service Booking</option>
                      <option value="nutrition-consultation">Nutrition Consultation</option>
                      <option value="partnership">Partnership/Collaboration</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && <span className="error-text">{errors.subject}</span>}
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
                    className={errors.message ? 'error' : ''}
                    disabled={formStatus.isSubmitting}
                  ></textarea>
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <button 
                  type="submit" 
                  className={`submit-btn ${formStatus.isSubmitting ? 'submitting' : ''}`}
                  disabled={formStatus.isSubmitting}
                >
                  {formStatus.isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="contact-page-map">
        <div className="contact-page-container">
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
        <div className="contact-page-container">
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
