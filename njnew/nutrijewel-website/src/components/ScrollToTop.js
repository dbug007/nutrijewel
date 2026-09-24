import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { scrollToTop as smoothScrollToTop } from '../lib/smoothScroll';
import './ScrollToTop.css';

/* Checkout is one short form ending in the Pay button; a floating button there
   only ever sits on top of it. */
const HIDDEN_ON = ['/checkout'];

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => window.removeEventListener('scroll', toggleVisibility, { passive: true });
  }, []);

  const scrollToTop = () => smoothScrollToTop();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
