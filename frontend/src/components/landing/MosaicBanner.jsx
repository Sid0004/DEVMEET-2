"use client";

import React from 'react';
import PixelTetris from './PixelTetris';

export default function MosaicBanner() {
  return (
    <div
      style={{
        width: '100%',
        height: '135px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--color-border-default)',
        borderBottom: '1px solid var(--color-border-default)',
        backgroundColor: 'var(--color-canvas-subtle)'
      }}
      aria-hidden="true"
    >
      <PixelTetris
        boardColor="rgba(0, 0, 0, 0.03)"
        colors={['#1877F2', '#8250DF', '#2DA44E', '#BF8700', '#0969DA', '#FF5C5C']}
        cellSize={18}
        gap={2}
        rounded={3}
        movement={6}
        dropSpeed={3}
      />
    </div>
  );
}
