import React from 'react';
import './Buttons.css'; // Let's define the CSS alongside if needed, or use inline styles / utility classes. 
// Since we have CSS variables, we can use CSS modules or standard CSS. Let's create Buttons.css

export const PrimaryWhiteButton = ({ children, onClick }) => {
  return (
    <button className="btn-primary" onClick={onClick}>
      {children}
    </button>
  );
};

export const OutlinedButton = ({ children, onClick, showArrow }) => {
  return (
    <button className="btn-outlined" onClick={onClick}>
      {children}
      {showArrow && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      )}
    </button>
  );
};

export const ChatPillButton = ({ onClick }) => {
  return (
    <button className="btn-chat-pill" onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      LET'S TRY
    </button>
  );
};
