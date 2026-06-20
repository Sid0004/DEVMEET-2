import React from 'react';

export const AvailabilityBadge = ({ available = true, text = "2/5 SPOTS LEFT FOR APRIL", highlight = false }) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 12px',
      borderRadius: 'var(--radius-badges)',
      backgroundColor: 'transparent',
      fontFamily: 'var(--font-aeonik)',
      fontSize: 'var(--text-caption)',
      color: highlight ? 'var(--color-amber-whisper)' : 'var(--color-frost-text)',
      letterSpacing: 'var(--tracking-caption)',
      textTransform: 'uppercase'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: available ? '#22c55e' : 'var(--color-smoke)' // Green status dot
      }} />
      {text}
    </div>
  );
};
