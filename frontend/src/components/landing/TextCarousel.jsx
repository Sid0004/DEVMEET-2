"use client";

import React, { useEffect, useState } from 'react';

const ROTATION_INTERVAL_MS = 2800;

export default function TextCarousel({
  prefix = 'DEVMEET FOR',
  texts = ['PAIR CODING', 'TECH INTERVIEWS', 'SYSTEM DESIGN', 'AI PROCTORING', 'REMOTE TEAMS'],
  color = '#ffffff',
  prefixColor = 'var(--color-fg-default)',
  badgeBackground = '#1877F2',
  auto = true,
}) {
  const safeTexts = texts && texts.length > 0 ? texts : ['PAIR CODING', 'TECH INTERVIEWS', 'SYSTEM DESIGN', 'AI PROCTORING', 'REMOTE TEAMS'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'exiting' | 'entering'

  useEffect(() => {
    if (!auto || safeTexts.length <= 1) return;

    const intervalId = window.setInterval(() => {
      // Step 1: Current phrase slides UP and exits
      setPhase('exiting');

      // Step 2: Once exited, swap to next phrase at the bottom
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % safeTexts.length);
        setPhase('entering');

        // Step 3: Next phrase slides UP into center
        setTimeout(() => {
          setPhase('idle');
        }, 40);
      }, 340);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [auto, safeTexts.length]);

  const currentWord = safeTexts[currentIndex] || safeTexts[0];

  // Dynamic transform & opacity for smooth up/down flow
  let transform = 'translateY(0%)';
  let opacity = 1;
  let transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';

  if (phase === 'exiting') {
    transform = 'translateY(-125%)';
    opacity = 0;
    transition = 'transform 0.32s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.28s ease';
  } else if (phase === 'entering') {
    transform = 'translateY(125%)';
    opacity = 0;
    transition = 'none';
  } else if (phase === 'idle') {
    transform = 'translateY(0%)';
    opacity = 1;
    transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
        gap: '0.22em',
        userSelect: 'none',
        verticalAlign: 'baseline',
      }}
    >
      {prefix && (
        <span style={{ color: prefixColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {prefix}
        </span>
      )}

      {/* Blue Fixed-Width Carousel Box with Large Bold Text */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: badgeBackground,
          color,
          borderRadius: 0,
          padding: '0.04em 0.3em',
          width: '15.6ch',
          height: '1.14em',
          lineHeight: 1.14,
          overflow: 'hidden',
          verticalAlign: 'baseline',
          boxSizing: 'border-box',
          textAlign: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            width: '100%',
            textAlign: 'center',
            transform,
            opacity,
            transition,
            willChange: 'transform, opacity',
          }}
        >
          {currentWord}
        </span>
      </span>
    </span>
  );
}
