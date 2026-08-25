import React from 'react';
import { useHeaderReveal } from '../hooks/useHeaderReveal';
import './TopMarquee.css';

const MARQUEE_TEXT = 'Stay tuned for our launch offer | We deliver pan India';
/* Repeated enough that one "half" is wider than any realistic viewport, so the
   -50% loop never shows empty space before the text continues. */
const REPEAT = 8;

const Half = () => (
  <div className="top-marquee-half">
    {Array.from({ length: REPEAT }).map((_, i) => (
      <span className="top-marquee-item" key={i}>
        {MARQUEE_TEXT}
        <span className="top-marquee-divider">•</span>
      </span>
    ))}
  </div>
);

const TopMarquee = () => {
  const { isHome, state: headerState } = useHeaderReveal();
  const homeClass = isHome ? ` marquee--home${headerState === 'revealed' ? ' is-revealed' : ''}` : '';
  return (
    <div className={`top-marquee${homeClass}`} role="status" aria-label={MARQUEE_TEXT}>
      {/* Two identical halves; the track scrolls exactly one half (-50%) and repeats seamlessly */}
      <div className="top-marquee-track" aria-hidden="true">
        <Half />
        <Half />
      </div>
    </div>
  );
};

export default TopMarquee;
