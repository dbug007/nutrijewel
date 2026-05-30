import React from 'react';
import './TopMarquee.css';

const MARQUEE_TEXT = 'Stay tuned for our launch offer | We deliver pan India';

const TopMarquee = () => {
  return (
    <div className="top-marquee" role="status" aria-label={MARQUEE_TEXT}>
      <div className="top-marquee-track">
        <span className="top-marquee-item">{MARQUEE_TEXT}</span>
        <span className="top-marquee-divider" aria-hidden="true">•</span>
        <span className="top-marquee-item">{MARQUEE_TEXT}</span>
        <span className="top-marquee-divider" aria-hidden="true">•</span>
      </div>
      <div className="top-marquee-track" aria-hidden="true">
        <span className="top-marquee-item">{MARQUEE_TEXT}</span>
        <span className="top-marquee-divider" aria-hidden="true">•</span>
        <span className="top-marquee-item">{MARQUEE_TEXT}</span>
        <span className="top-marquee-divider" aria-hidden="true">•</span>
      </div>
    </div>
  );
};

export default TopMarquee;