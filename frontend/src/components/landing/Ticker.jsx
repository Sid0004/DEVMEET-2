"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Ticker() {
  const tickerItems = [
    '⚡ Real-Time Collaborative Coding with 50+ Multiplayer Cursors',
    '🎥 Crystal-Clear In-Room HD Video & Multi-Speaker Audio',
    '🤖 AI Interviewer Copilot: Live Hints & Complexity Analysis',
    '👁️ AI Proctoring: Gaze Tracking, Tab-Switch & Anti-Cheat Checks',
    '🚀 Run Python, TypeScript, Rust, Go, Java & C++ in Cloud MicroVMs'
  ];

  return (
    <div id="ticker" className="ticker-container" role="region" aria-label="Product Highlights">
      <div className="ticker-track">
        {tickerItems.map((text, idx) => (
          <a
            key={idx}
            href="#demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              color: '#ffffff',
              textDecoration: 'none'
            }}
          >
            <Sparkles size={15} style={{ opacity: 0.8 }} />
            <span>{text}</span>
            <span style={{ opacity: 0.5 }}>⎮</span>
          </a>
        ))}
        {/* Duplicate track for seamless infinite loop */}
        {tickerItems.map((text, idx) => (
          <a
            key={`dup-${idx}`}
            href="#demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              color: '#ffffff',
              textDecoration: 'none'
            }}
          >
            <Sparkles size={15} style={{ opacity: 0.8 }} />
            <span>{text}</span>
            <span style={{ opacity: 0.5 }}>⎮</span>
          </a>
        ))}
      </div>
    </div>
  );
}
