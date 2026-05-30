import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './PlumCakePopup.css';

const PlumCakePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showCount, setShowCount] = useState(0);

  useEffect(() => {
    // Preload the image first
    const img = new Image();
    img.src = `${process.env.PUBLIC_URL}/images/poster_plumcake.jpg`;
    img.onload = () => {
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    // Check if user has already seen both popups in this session
    const popupCount = sessionStorage.getItem('plumCakePopupCount');
    const count = popupCount ? parseInt(popupCount) : 0;
    
    if (count < 2 && imageLoaded) {
      // First popup after 0.8 seconds once image is loaded
      const firstTimer = setTimeout(() => {
        setIsVisible(true);
        setShowCount(1);
        sessionStorage.setItem('plumCakePopupCount', '1');
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
        sessionStorage.setItem('plumCakePopupCount', '2');
      }, 6000);
      
      return () => clearTimeout(secondTimer);
    }
  };

  const handleBuyNow = () => {
    const message = "Hi! I want to buy Golden Plum Kiss (Plum Cake) 500gm for ₹850";
    const whatsappUrl = `https://wa.me/919960637656?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="popup-overlay"></div>
      <div className="popup-container">
        <button className="popup-close" onClick={handleClose} aria-label="Close">
          <X size={24} />
        </button>
        
        <div className="popup-content">
          <div className="popup-image-wrapper">
            <img 
              src={`${process.env.PUBLIC_URL}/images/poster_plumcake.jpg`}
              alt="Golden Plum Kiss - Festive Plum Cake" 
              className="popup-image"
            />
          </div>
          
          <div className="popup-actions">
            <button className="popup-buy-btn" onClick={handleBuyNow}>
              🎄 Buy Now - 500gm for ₹850
            </button>
            <p className="popup-delivery-note">
              🎁 Perfect for Christmas & New Year celebrations!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlumCakePopup;
