"use client";

import React, { useState } from 'react';

export function ElasticStack({
  items,
  itemSize = 38,
  overlap = 14,
  pushForce = 12,
  className = '',
  style = {},
  ...props
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = items.length;
  // Custom spring-like easing from Vengeance UI
  const springEasing = 'linear(0, 0.79 14.4%, 1.026 22.4%, 1.164 31.2%, 1.207 38.2%, 1.208 46.2%, 1.033 80%, 1)';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        ...style
      }}
      onMouseLeave={() => setHoveredIndex(null)}
      {...props}
    >
      {items.map((item, i) => {
        let translateX = 0;
        let scale = 1;
        let zIndex = i; // Base stacking order
        const isHovered = hoveredIndex === i;

        if (hoveredIndex !== null) {
          if (i > hoveredIndex) {
            translateX = Math.min(pushForce * (total - i), overlap * 1.2);
          } else if (i < hoveredIndex) {
            translateX = -Math.min(pushForce * (i + 1), overlap * 1.2);
          } else {
            scale = 1.22;
            zIndex = 100;
          }
        }

        return (
          <div
            key={item.id || i}
            onMouseEnter={() => setHoveredIndex(i)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: '#f1f1f1',
              border: '2px solid #ffffff',
              boxShadow: isHovered
                ? '0 8px 16px rgba(0,0,0,0.18)'
                : '0 2px 4px rgba(0,0,0,0.06)',
              width: itemSize,
              height: itemSize,
              marginLeft: i === 0 ? 0 : -overlap,
              transform: `translateX(${translateX}px) scale(${scale})`,
              transition: 'all 0.4s',
              transitionTimingFunction: springEasing,
              zIndex,
              flexShrink: 0,
              overflow: 'hidden'
            }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name || `Avatar ${i}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: '#666666'
                }}
              >
                {item.name ? item.name.charAt(0) : i + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ElasticStack;
