import React, { useState, useEffect, useRef } from 'react';
import './OptimizedImage.css';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  lazy = true,
  priority = false,
  blur = true 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef(null);

  // Generate WebP and fallback sources
  const getImageSources = (imagePath) => {
    if (!imagePath) return { webp: '', fallback: '' };
    
    const ext = imagePath.split('.').pop();
    const basePath = imagePath.replace(`.${ext}`, '');
    
    return {
      webp: `${basePath}.webp`,
      fallback: imagePath
    };
  };

  const { webp, fallback } = getImageSources(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [lazy, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    // If WebP fails, fallback to original
    console.warn('Image failed to load:', e.target.src);
  };

  return (
    <div 
      ref={imgRef}
      className={`optimized-image-wrapper ${className} ${isLoaded ? 'loaded' : ''} ${blur ? 'blur-up' : ''}`}
    >
      {isInView ? (
        <picture>
          <source srcSet={webp} type="image/webp" />
          <img
            src={fallback}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            className={`optimized-image ${isLoaded ? 'fade-in' : ''}`}
          />
        </picture>
      ) : (
        <div className="image-placeholder" />
      )}
    </div>
  );
};

export default OptimizedImage;
