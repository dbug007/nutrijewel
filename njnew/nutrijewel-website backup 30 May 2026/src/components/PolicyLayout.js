import React, { useEffect } from 'react';
import '../styles/PolicyPages.css';

const PolicyLayout = ({ title, lastUpdated, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
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
