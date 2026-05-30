import React, { useState, useEffect } from 'react';
import './WeightSelector.css';

const WeightSelector = ({ 
  product, 
  onVariantChange, 
  variant = 'default', 
  showImagePreview = false,
  imagePreviewSize = 'compact' 
}) => {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants ? product.variants[0] : null
  );
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      setSelectedVariant(defaultVariant);
      if (onVariantChange) {
        onVariantChange(defaultVariant);
      }
    }
    // Intentional: reset only when product identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]); // Only depend on product.id to avoid infinite loops

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setIsSelected(true);
    
    // Call parent callback
    if (onVariantChange) {
      onVariantChange(variant);
    }
    
    // Reset selection state after animation
    setTimeout(() => setIsSelected(false), 1000);
  };

  // If product doesn't have variants, don't render the selector
  if (!product.variants || product.variants.length <= 1) {
    return null;
  }

  const getDiscountPercent = (variant) => {
    if (variant.originalPrice && variant.originalPrice > variant.price) {
      return Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
    }
    return 0;
  };

  const containerClass = `weight-selector ${
    variant === 'premium' ? 'weight-selector-premium' : 
    variant === 'compact' ? 'weight-selector-compact' : ''
  } ${isSelected ? 'weight-selector-selected' : ''}`;

  return (
    <div className={containerClass}>
      <label 
        htmlFor={`weight-select-${product.id}`} 
        className="weight-selector-label"
      >
        Select Weight & Price
      </label>
      <div className="weight-selector-wrapper">
        <select
          id={`weight-select-${product.id}`}
          value={selectedVariant?.weight || ''}
          onChange={(e) => {
            const newVariant = product.variants.find(v => v.weight === e.target.value);
            if (newVariant) {
              handleVariantChange(newVariant);
            }
          }}
          className="weight-selector-select"
        >
          {product.variants.map((variant, index) => {
            const discount = getDiscountPercent(variant);
            return (
              <option 
                key={index} 
                value={variant.weight}
                data-price={variant.price}
              >
                {variant.weight} - ₹{variant.price}
                {discount > 0 && ` (${discount}% OFF)`}
              </option>
            );
          })}
        </select>
      </div>
      
      {/* Price summary for selected variant */}
      {selectedVariant && (
        <div className="weight-price-summary">
          <div className="selected-variant-info">
            <span className="selected-weight">{selectedVariant.weight}</span>
            <div className="selected-pricing">
              <span className="selected-price">₹{selectedVariant.price}</span>
              {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
                <>
                  <span className="selected-original-price">₹{selectedVariant.originalPrice}</span>
                  <span className="selected-discount">
                    {getDiscountPercent(selectedVariant)}% OFF
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightSelector;