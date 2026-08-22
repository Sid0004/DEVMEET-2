"use client";

import React, { useRef, useState, useEffect } from 'react';
import AsciiImage from './AsciiImage';
import ElasticStack from './ElasticStack';

// Visual ASCII Wrapper for each card
function AsciiArt({ src, alt, widthRatio = 1.0, height = '200px' }) {
  const artRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    const measure = () => setWidth(art.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(art);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={artRef}
      style={{
        position: 'relative',
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {width > 0 && (
        <div style={{ width: `${Math.round(width * widthRatio)}px`, height: '100%' }}>
          <AsciiImage
            image={{ src, alt }}
            fit="contain"
            columns={Math.max(60, Math.round(width / 1.57))}
            inkColor="#2b2b2b"
            revealOptions={{
              size: Math.max(30, Math.round(width / 6)),
              softness: 12
            }}
          />
        </div>
      )}
    </div>
  );
}

// Clean, flat sharp-edged card with soft green background hover state (matching upper section red hover)
function Plate({ children, style = {}, innerStyle = {} }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="feature-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '6px',
        backgroundColor: isHovered ? '#f0fff4' : '#ffffff',
        border: '1px solid var(--color-border-default)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transition: 'background-color 0.2s ease',
        ...style,
        ...innerStyle
      }}
    >
      {children}
    </div>
  );
}

export default function FeaturesWhy() {
  const avatarItems = [
    { id: 1, image: '/originkit/features-04/avatar-1.png', name: 'Dev 1' },
    { id: 2, image: '/originkit/features-04/avatar-2.png', name: 'Dev 2' },
    { id: 3, image: '/originkit/features-04/avatar-3.png', name: 'Dev 3' },
    { id: 4, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', name: 'Dev 4' }
  ];

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--color-canvas-default)',
        padding: '80px 24px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '48px'
        }}
      >
        {/* Top Header */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px',
            maxWidth: '680px'
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-default)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#121212',
              margin: 0
            }}
          >
            Built for Pair Coding &amp; Technical Hiring.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-default)',
              fontSize: '17px',
              color: 'rgba(18, 18, 18, 0.65)',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            Real-time multiplayer IDE, live AI interviewing copilot, and on-device proctoring in a single room.
          </p>
        </header>

        {/* Bento 3-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            width: '100%',
            alignItems: 'stretch'
          }}
        >
          {/* Column 1: Trusted + Focus / Collaborate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Pill 1: Trusted by 5,000+ Teams with Vengeance UI ElasticStack */}
            <Plate
              style={{ height: '76px' }}
              innerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 20px'
              }}
            >
              <ElasticStack items={avatarItems} itemSize={36} overlap={12} pushForce={12} />
              <p
                style={{
                  fontFamily: 'var(--font-default)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#121212',
                  margin: 0
                }}
              >
                Trusted by many Teams &amp; Devs
              </p>
            </Plate>

            {/* Card 1: Collaborate (Isometric Cube) */}
            <Plate
              style={{ flex: 1, minHeight: '420px' }}
              innerStyle={{
                padding: '24px 24px',
                justifyContent: 'space-between'
              }}
            >
              <AsciiArt
                src="/originkit/features-04/focus.png"
                alt="An isometric cube rendered in ASCII characters"
                height="190px"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#121212',
                    margin: 0
                  }}
                >
                  Multiplayer IDE, Video &amp; Chat
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '14px',
                    color: 'rgba(18, 18, 18, 0.65)',
                    lineHeight: 1.55,
                    margin: 0
                  }}
                >
                  Zero-install workspace. Code, compile, and debug collaboratively with sub-millisecond CRDT sync, built-in noise-cancelling video, and live code chat.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                  {[
                    'Live multi-cursor editing with presence avatars',
                    'In-room markdown chat with syntax code snippets',
                    'Cloud execution for 40+ programming languages',
                    '1-click GitHub repo import & branch sync'
                  ].map((feat, fIdx) => (
                    <li
                      key={fIdx}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: '#333333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px'
                      }}
                    >
                      <span style={{ color: '#1877F2', fontWeight: 800 }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Plate>
          </div>

          {/* Column 2: Connect / Interview + Sync Pill */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Card 2: Interview Companion (Interlocking Blocks) */}
            <Plate
              style={{ flex: 1, minHeight: '420px' }}
              innerStyle={{
                padding: '24px 24px',
                justifyContent: 'space-between'
              }}
            >
              <AsciiArt
                src="/originkit/features-04/connect.png"
                alt="Interlocking isometric blocks rendered in ASCII characters"
                height="190px"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#121212',
                    margin: 0
                  }}
                >
                  AI Interview Companion
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '14px',
                    color: 'rgba(18, 18, 18, 0.65)',
                    lineHeight: 1.55,
                    margin: 0
                  }}
                >
                  Never scramble for hints or scratch-pad math again. Real-time background analysis prompts interviewers with insightful questions on the fly.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                  {[
                    'Live Big-O time & space complexity feedback',
                    'Adaptive hints & follow-up questions for interviewers',
                    'Instant post-interview rubric & scorecard export'
                  ].map((feat, fIdx) => (
                    <li
                      key={fIdx}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: '#333333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px'
                      }}
                    >
                      <span style={{ color: '#8250df', fontWeight: 800 }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Plate>

            {/* Pill 2: < 50ms Real-Time Sync */}
            <Plate
              style={{ height: '76px' }}
              innerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px'
              }}
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2da44e', flexShrink: 0, boxShadow: '0 0 8px rgba(45, 164, 78, 0.6)' }} />
              <p
                style={{
                  fontFamily: 'var(--font-default)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#121212',
                  margin: 0
                }}
              >
                &lt; 50ms Real-Time Sync &amp; 99.99% Uptime
              </p>
            </Plate>
          </div>

          {/* Column 3: Proctor & Security (Isometric Staircase) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Plate
              style={{ height: '100%', minHeight: '512px' }}
              innerStyle={{
                padding: '24px 24px',
                justifyContent: 'space-between'
              }}
            >
              <AsciiArt
                src="/originkit/features-04/scale.png"
                alt="A rising staircase of isometric blocks rendered in ASCII characters"
                height="240px"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#121212',
                    margin: 0
                  }}
                >
                  AI Proctoring &amp; Integrity
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '14px',
                    color: 'rgba(18, 18, 18, 0.65)',
                    lineHeight: 1.55,
                    margin: 0
                  }}
                >
                  Eliminate cheating guesswork with privacy-first on-device computer vision models running locally in the candidate's browser.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                  {[
                    'Gaze tracking & off-screen look detection',
                    'Multi-face & unauthorized person alerts',
                    'Tab switch, blur & second monitor audit log',
                    'Copy-paste cadence & LLM anomaly score'
                  ].map((feat, fIdx) => (
                    <li
                      key={fIdx}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: '#333333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px'
                      }}
                    >
                      <span style={{ color: '#bf8700', fontWeight: 800 }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Plate>
          </div>
        </div>
      </div>
    </section>
  );
}
