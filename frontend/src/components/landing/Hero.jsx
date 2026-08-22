"use client";

import React, { useState } from 'react';
import { ArrowUpRight, Terminal, Copy, Check } from 'lucide-react';
import TextCarousel from './TextCarousel';
import GyroRings from './GyroRings';

export default function Hero() {
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [roomName, setRoomName] = useState('devmeet-alpha-room');

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`https://devmeet.io/room/${roomName}`);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2500);
  };

  return (
    <section id="hero" style={{ borderBottom: '1px solid var(--color-border-default)', backgroundColor: '#ffffff' }}>
      {/* 1. Giant DEVMEET Animated Title Banner */}
      <div
        style={{
          borderBottom: '1px solid var(--color-border-default)',
          padding: '20px 28px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-default)',
            fontSize: 'clamp(28px, 5.6vw, 92px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1600px',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            userSelect: 'none'
          }}
        >
          <TextCarousel
            prefix="DEVMEET FOR"
            texts={['PAIR CODING', 'TECH INTERVIEWS', 'SYSTEM DESIGN', 'AI PROCTORING', 'REMOTE TEAMS']}
            badgeBackground="#1877F2"
            color="#ffffff"
          />
        </div>
      </div>

      {/* 2. Two-Sided (50 / 50) Split Hero Grid */}
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          borderLeft: '1px solid var(--color-border-default)',
          borderRight: '1px solid var(--color-border-default)',
        }}
        className="hero-split-grid"
      >
        {/* Left Side: 3D Interactive Gyro Rings on Solid Black */}
        <div
          style={{
            position: 'relative',
            borderRight: '1px solid var(--color-border-default)',
            backgroundColor: '#000000',
            minHeight: '580px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <GyroRings
            rings={4}
            finish="metal"
            tint="#D8D8D8"
            color="#1877F2"
            thickness={5}
            innerRadius={42}
            spin={2.2}
            hoverBoost={10}
            dragSensitivity={3}
            sizePercent={102}
          />
        </div>

        {/* Right Side: Abstract Concept — Combining Daily Development & Technical Interviews (50%) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '48px 40px'
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-default)',
                fontSize: 'clamp(28px, 3.4vw, 44px)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: 'var(--color-fg-default)',
                marginBottom: '16px'
              }}
            >
              Where engineers build together and hire the best.
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--color-fg-muted)', lineHeight: 1.6, maxWidth: '560px', marginBottom: '32px' }}>
              DEVMEET bridges day-to-day software development and technical hiring. Whether you’re pair programming with teammates or evaluating candidates in a live assessment, everything happens in one shared, intelligent browser room.
            </p>
          </div>

          {/* Two Core Dual-Purpose Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1px',
              backgroundColor: 'var(--color-border-default)',
              border: '1px solid var(--color-border-default)'
            }}
          >
            {/* Pillar 1: Team Development & Pair Coding */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-default)', fontSize: '16px', fontWeight: 800, color: 'var(--color-fg-default)' }}>
                  For Engineering Teams
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-primary)', backgroundColor: 'var(--color-accent-subtle)', padding: '3px 8px' }}>
                  DEV MODE
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-default)', fontSize: '14px', color: 'var(--color-fg-muted)', lineHeight: 1.5, margin: 0 }}>
                Real-time multiplayer coding, shared terminal microVMs, and HD video calls to build and debug software together without friction.
              </p>
            </div>

            {/* Pillar 2: Technical Hiring & Assessments */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-default)', fontSize: '16px', fontWeight: 800, color: 'var(--color-fg-default)' }}>
                  For Technical Hiring
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#8250df', backgroundColor: 'rgba(130, 80, 223, 0.1)', padding: '3px 8px' }}>
                  INTERVIEW MODE
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-default)', fontSize: '14px', color: 'var(--color-fg-muted)', lineHeight: 1.5, margin: 0 }}>
                Live algorithmic and system design assessments with instant code execution, AI candidate insights, and structured rubrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-feature-card:hover {
          background-color: var(--color-canvas-subtle) !important;
        }
        @media (min-width: 1012px) {
          .hero-split-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
