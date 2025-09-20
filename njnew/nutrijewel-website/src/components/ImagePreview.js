import React, { useState } from 'react';
import './ImagePreview.css';

const ImagePreview = ({ 
  productImage, 
  productName, 
  variant = 'default', 
  className = '', 
  showImageOnly = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  if (showImageOnly) {
    return (
      <div className={`image-preview-container image-only ${variant} ${className}`}>
        <div className="image-wrapper">
          {!imageError ? (
            <img
              src={productImage}
              alt={productName}
              className={`product-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="image-placeholder">
              <div className="nj-logo-placeholder">
                <span>NJ</span>
              </div>
            </div>
          )}
          {!imageLoaded && !imageError && (
            <div className="image-loading">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`image-preview-container ${variant} ${className}`}>
      <div className="image-wrapper">
        {!imageError ? (
          <img
            src={productImage}
            alt={productName}
            className={`product-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="image-placeholder">
            <div className="nj-logo-placeholder">
              <span>NJ</span>
            </div>
          </div>
        )}
        {!imageLoaded && !imageError && (
          <div className="image-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
      
      <div className="image-overlay">
        <div className="product-name">{productName}</div>
      </div>
    </div>
  );
};

export default ImagePreview;