import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '../lib/smoothScroll';

const ScrollToTopOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Jump (never animate) to the top when the route changes.
    scrollToTop({ immediate: true });
  }, [pathname]);

  return null;
};

export default ScrollToTopOnRouteChange;