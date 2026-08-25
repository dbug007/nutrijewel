import React, { useEffect } from 'react';
import { scrollToTop } from '../lib/smoothScroll';
import '../styles/PolicyPages.css';

const PolicyLayout = ({ title, lastUpdated, children }) => {
  useEffect(() => {
    scrollToTop({ immediate: true });
  }, []);

  return (
    <div className="policy-page">
      <div className="policy-container">
        <div className="policy-header">
          <h1 className="policy-title">{title}</h1>
          <p className="policy-last-updated">Last Updated: {lastUpdated}</p>
        </div>
        <div className="policy-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PolicyLayout;
