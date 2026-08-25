import { useEffect } from 'react';
import { initSmoothScroll, destroySmoothScroll } from '../lib/smoothScroll';

/* Starts Lenis for the lifetime of the app. Renders nothing.
   All scrolling still goes through src/lib/smoothScroll.js helpers. */

export default function SmoothScroll() {
  useEffect(() => {
    initSmoothScroll();
    return destroySmoothScroll;
  }, []);

  return null;
}
