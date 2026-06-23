import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './ThandaiCakePopup.css';

const ThandaiCakePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showCount, setShowCount] = useState(0);

  useEffect(() => {
    // Preload the image first
    const img = new Image();
    img.src = `${process.env.PUBLIC_URL}/images/thandaicake.jpg`;
    img.onload = () => {
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    // Check if user has already seen both popups in this session
    const popupCount = sessionStorage.getItem('thandaiCakePopupCount');
    const count = popupCount ? parseInt(popupCount) : 0;
    
    if (count < 2 && imageLoaded) {
      // First popup after 0.8 seconds once image is loaded
      const firstTimer = setTimeout(() => {
        setIsVisible(true);
        setShowCount(1);
        sessionStorage.setItem('thandaiCakePopupCount', '1');
      }, 800);

      return () => clearTimeout(firstTimer);
    }
  }, [imageLoaded]);

  const handleClose = () => {
    setIsVisible(false);
    
    // If this was the first show, schedule the second popup
    if (showCount === 1) {
      const secondTimer = setTimeout(() => {
        setIsVisible(true);
        setShowCount(2);
        sessionStorage.setItem('thandaiCakePopupCount', '2');
      }, 6000);
      
      return () => clearTimeout(secondTimer);
    }
  };

  const handleBuyNow = () => {
    const message = "Hi! I want to order the Holi Special Thandai Maharaja Cake 🎨🍰";
    const whatsappUrl = `https://wa.me/919960637656?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="thandai-popup-overlay"></div>
      <div className="thandai-popup-container">
        <button className="thandai-popup-close" onClick={handleClose} aria-label="Close">
          <X size={24} />
        </button>
        
        <div className="thandai-popup-content">
          {/* Header Badge */}
          <div className="thandai-popup-header-badge">
            🎨 Holi Special - Limited Time! 🎨
          </div>

          <div className="thandai-popup-image-wrapper">
            <img 
              src={`${process.env.PUBLIC_URL}/images/thandaicake.jpg`}
              alt="Holi Special - Thandai Maharaja Cake" 
              className="thandai-popup-image"
            />
          </div>
          
          <div className="thandai-popup-info">
            <h2 className="thandai-popup-title">Thandai Maharaja Cake</h2>
            <p className="thandai-popup-description">
              An authentic, guilt-free version that's soaked in homemade thandai masala, 
              packed with nuts, spices, and festive vibes, with zero regrets! 😉
            </p>

            {/* Features List */}
            <div className="thandai-popup-features">
              <span className="thandai-feature">❌ No Egg</span>
              <span className="thandai-feature">❌ No Refined Sugar</span>
              <span className="thandai-feature">❌ No Maida</span>
              <span className="thandai-feature">❌ No Preservatives</span>
              <span className="thandai-feature">❌ No Artificial Flavours/Colours/Sweeteners</span>
            </div>

            {/* Price Section */}
            <div className="thandai-popup-price-grid">
              <div className="thandai-price-row">
                <span className="thandai-weight-label">500g</span>
                <span className="thandai-original-price">₹650</span>
                <span className="thandai-arrow">→</span>
                <span className="thandai-special-price">₹499</span>
              </div>
              <div className="thandai-price-row">
                <span className="thandai-weight-label">1kg</span>
                <span className="thandai-original-price">₹1300</span>
                <span className="thandai-arrow">→</span>
                <span className="thandai-special-price">₹999</span>
              </div>
            </div>
            <div className="thandai-badge-wrap">
              <span className="thandai-badge">🎨 HOLI SPECIAL OFFER!</span>
            </div>
          </div>
          
          <div className="thandai-popup-actions">
            <button className="thandai-popup-buy-btn" onClick={handleBuyNow}>
              🛒 Grab Now via WhatsApp
            </button>
            <p className="thandai-popup-delivery-note">
              🌈 Perfect for Holi celebrations! Order now before it's gone!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThandaiCakePopup;
