import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/*
 * Site-wide smooth scrolling.
 *
 * This is the ONLY module that knows Lenis exists. Everything else scrolls via
 * scrollToElement() / scrollToTop(), which fall back to native scrolling when
 * Lenis is off, so the site behaves correctly whether or not it's running.
 *
 * Lenis is skipped entirely under prefers-reduced-motion: hijacking the scroll
 * wheel is exactly what that setting is asking us not to do.
 */

let lenis = null;
let rafId = 0;

const hasWindow = typeof window !== 'undefined';

const prefersReducedMotion = () =>
  hasWindow && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSmoothScroll() {
  if (lenis || !hasWindow || prefersReducedMotion()) return null;

  try {
    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out, matches --ease-entrance
      smoothWheel: true,
      // Touch devices keep native momentum, overriding it feels worse, not better.
      syncTouch: false,
    });
  } catch (_) {
    lenis = null; // never let a scroll enhancement break the page
    return null;
  }

  const raf = (time) => {
    if (!lenis) return;
    lenis.raf(time);
    rafId = window.requestAnimationFrame(raf);
  };
  rafId = window.requestAnimationFrame(raf);

  return lenis;
}

export function destroySmoothScroll() {
  if (rafId) window.cancelAnimationFrame(rafId);
  rafId = 0;
  if (lenis) {
    try { lenis.destroy(); } catch (_) { /* ignore */ }
    lenis = null;
  }
}

/* Scroll an element into view. `block` mirrors scrollIntoView's option. */
export function scrollToElement(el, { block = 'start', offset = 0 } = {}) {
  if (!el) return;

  if (!lenis) {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block });
    return;
  }

  let finalOffset = offset;
  if (block === 'center') {
    const rect = el.getBoundingClientRect();
    finalOffset -= Math.max(0, (window.innerHeight - rect.height) / 2);
  }

  lenis.scrollTo(el, { offset: finalOffset });
}

/* Scroll to the top. `immediate` jumps without animating (used on route change). */
export function scrollToTop({ immediate = false } = {}) {
  if (lenis) {
    lenis.scrollTo(0, { immediate });
    return;
  }
  if (!hasWindow) return;
  window.scrollTo({ top: 0, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
}

/* Convenience for the common "scroll to this id" case. */
export function scrollToId(id, options) {
  if (!hasWindow) return;
  scrollToElement(document.getElementById(id), options);
}
