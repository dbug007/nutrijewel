import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoScroll } from '../hooks/useAutoScroll';
import './Shelf.css';

/*
 * Horizontal shelf.
 *
 * Built on the native scroll pattern the site already uses in TopSellers,
 * TestimonialsSection and InstagramFeed (flex row, overflow-x, hidden scrollbar,
 * negative-margin bleed) rather than a carousel library. It costs no JavaScript
 * to scroll, it swipes with real momentum on a phone, and it keeps one rail
 * pattern across the whole site.
 *
 * Children set their own widths. This only makes them non-shrinking and snappable.
 *
 *   <Shelf label="Ready to gift" arrows>
 *     {cards}
 *   </Shelf>
 */

export default function Shelf({
  children,
  label,
  arrows = false,
  autoScroll = null,
  className = '',
  edge = true,
}) {
  const ref = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useAutoScroll(ref, { ...(autoScroll || {}), enabled: !!autoScroll });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    sync();
    el.addEventListener('scroll', sync, { passive: true });

    // Card count and viewport both change what is reachable.
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(sync);
      ro.observe(el);
    }
    return () => {
      el.removeEventListener('scroll', sync);
      if (ro) ro.disconnect();
    };
  }, [sync, children]);

  /* One card's worth, measured from the first two children so it stays correct
     whatever width the caller gave them. */
  const step = () => {
    const el = ref.current;
    if (!el) return 0;
    const kids = el.children;
    if (kids.length >= 2) return Math.max(1, kids[1].offsetLeft - kids[0].offsetLeft);
    return el.clientWidth * 0.85;
  };

  const nudge = (dir) => ref.current?.scrollBy({ left: dir * step(), behavior: 'smooth' });

  return (
    <div className={`nj-shelf-wrap${arrows ? ' has-arrows' : ''} ${className}`.trim()}>
      {arrows && (
        <button
          type="button"
          className="nj-shelf-arrow prev"
          onClick={() => nudge(-1)}
          disabled={!canPrev}
          aria-label={`Scroll ${label || 'shelf'} back`}
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <div
        className={`nj-shelf${edge ? ' is-edge' : ''}`}
        ref={ref}
        role="group"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>

      {arrows && (
        <button
          type="button"
          className="nj-shelf-arrow next"
          onClick={() => nudge(1)}
          disabled={!canNext}
          aria-label={`Scroll ${label || 'shelf'} forward`}
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
