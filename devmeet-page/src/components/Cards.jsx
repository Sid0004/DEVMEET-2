import React from 'react';
import './Cards.css';

export const EditorialFeatureItem = ({ number, title, description }) => {
  return (
    <div className="editorial-feature">
      <div className="editorial-feature-number font-mono">{number}</div>
      <div className="editorial-feature-content">
        <h3 className="editorial-feature-title">{title}</h3>
        <p className="editorial-feature-desc">{description}</p>
      </div>
    </div>
  );
};

export const EditorialFeatureList = ({ children }) => {
  return (
    <div className="editorial-feature-list">
      {children}
    </div>
  );
};

export const SplitModeCard = ({ title, subtitle, description, isDark }) => {
  return (
    <div className={`split-mode-card ${isDark ? 'split-mode-dark' : 'split-mode-light'}`}>
      <div className="split-mode-header">
        <span className="split-mode-subtitle font-mono">{subtitle}</span>
        <h3 className="split-mode-title">{title}</h3>
      </div>
      <p className="split-mode-desc">{description}</p>
    </div>
  );
};

export const SplitModeContainer = ({ children }) => {
  return (
    <div className="split-mode-container">
      {children}
    </div>
  );
}
