import { useEffect } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Auto-advancing horizontal shelf. Every `interval` ms it smoothly scrolls to the
 * next card; when it reaches the end it glides back to the start (no duplicated
 * cards). Manual free-scroll/drag works natively; auto-advance pauses on
 * hover / touch / drag / wheel / focus and resumes after `resumeDelay`.
 *
 * Disabled under prefers-reduced-motion; paused while off-screen.
 *
 * @param {React.RefObject<HTMLElement>} ref  the scroll container (overflow-x: auto)
 */
export function useAutoScroll(ref, { interval = 4000, resumeDelay = 2000 } = {}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return undefined;

    let paused = false;
    let visible = true;
    let resumeTimer = 0;

    const cardStep = () => {
      const kids = el.children;
      if (kids.length >= 2) return Math.max(1, kids[1].offsetLeft - kids[0].offsetLeft);
      return el.clientWidth;
    };

    const advance = () => {
      if (paused || !visible) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 1) return; // nothing to scroll
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' }); // loop back to the start
      } else {
        el.scrollBy({ left: cardStep(), behavior: 'smooth' });
      }
    };

    const timer = setInterval(advance, interval);

    const pause = () => { paused = true; if (resumeTimer) clearTimeout(resumeTimer); };
    const resumeSoon = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { paused = false; }, resumeDelay);
    };
    const nudge = () => { pause(); resumeSoon(); };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resumeSoon);
    el.addEventListener('pointerdown', pause);
    el.addEventListener('pointerup', resumeSoon);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resumeSoon, { passive: true });
    el.addEventListener('wheel', nudge, { passive: true });
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', resumeSoon);

    const io = new IntersectionObserver(
      (entries) => { visible = entries[0].isIntersecting; },
      { threshold: 0 }
    );
    io.observe(el);

    return () => {
      clearInterval(timer);
      if (resumeTimer) clearTimeout(resumeTimer);
      io.disconnect();
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resumeSoon);
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('pointerup', resumeSoon);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resumeSoon);
      el.removeEventListener('wheel', nudge);
      el.removeEventListener('focusin', pause);
      el.removeEventListener('focusout', resumeSoon);
    };
  }, [ref, interval, resumeDelay, reduceMotion]);
}
