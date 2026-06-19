import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Drives the mobile homepage header behaviour (direction-based):
 *   'minimal'  -> at the very top: transparent, logo-only, marquee hidden
 *   'revealed' -> scrolling up:    solid navbar + marquee visible
 *   'hidden'   -> scrolling down:  navbar + marquee slide away
 *
 * `isHome` lets components scope the behaviour to the homepage; the actual
 * mobile gating is done in CSS (@media max-width:767px), so these classes are
 * harmless on desktop / other routes.
 */
export function useHeaderReveal({ topThreshold = 16, delta = 4 } = {}) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [state, setState] = useState('minimal');
  const lastY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (y <= topThreshold) {
        setState('minimal');
      } else {
        const diff = y - lastY.current;
        if (diff > delta) setState('hidden');        // scrolling down
        else if (diff < -delta) setState('revealed'); // scrolling up
        // small movements: keep the current state
      }
      lastY.current = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update(); // sync initial state on mount / route change
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [topThreshold, delta, pathname]);

  return { isHome, state };
}
