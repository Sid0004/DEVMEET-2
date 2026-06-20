import React from 'react';

export const DisplayHeadline = ({ children }) => {
  return (
    <h1 style={{
      fontFamily: 'var(--font-aeonik)',
      fontSize: 'var(--text-display)',
      fontWeight: 'var(--font-weight-regular)',
      color: 'var(--color-frost-text)',
      lineHeight: 'var(--leading-display)',
      letterSpacing: 'var(--tracking-display)',
      textAlign: 'center',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {children}
    </h1>
  );
};

export const ClientAttribution = ({ clientName, category }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-smoke)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontFamily: 'var(--font-aeonik)',
          fontSize: 'var(--text-subheading)',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--color-frost-text)'
        }}>{clientName}</span>
        <span style={{ color: 'var(--color-onyx-edge)' }}>|</span>
        <span style={{
          fontFamily: 'var(--font-aeonik)',
          fontSize: 'var(--text-caption)',
          fontWeight: 'var(--font-weight-bold)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-caption)',
          color: 'var(--color-smoke)'
        }}>{category}</span>
      </div>
    </div>
  );
};
