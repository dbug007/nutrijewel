import { useEffect } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Auto-advancing horizontal shelf. Every `interval` ms it smoothly scrolls to the
 * next card. Manual free-scroll/drag works natively; the auto-advance pauses on
 * hover / touch / drag / wheel / focus and resumes after `resumeDelay`.
 *
 * Seamless infinite loop requires the container's children to be the items rendered
 * TWICE (a duplicated list). Disabled under prefers-reduced-motion; paused off-screen.
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
      if (kids.length >= 2) return kids[1].offsetLeft - kids[0].offsetLeft;
      return el.clientWidth;
    };
    const loopWidth = () => {
      const kids = el.children;
      if (kids.length >= 2) return kids[Math.floor(kids.length / 2)].offsetLeft;
      return el.scrollWidth / 2;
    };

    const advance = () => {
      if (paused || !visible) return;
      const step = cardStep();
      const lw = loopWidth();
      // About to cross into the duplicate half? Jump back by one full set first —
      // invisible because the content is identical — then smoothly step forward.
      if (lw > 0 && el.scrollLeft + step >= lw - 1) {
        el.scrollLeft -= lw;
      }
      el.scrollBy({ left: step, behavior: 'smooth' });
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
