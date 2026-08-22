"use client";

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import DitherReveal from './DitherReveal';
import roomImage from '@/assets/06b2c4c8c5431a0376cd4f9485f62899.jpg';
import devmeetLogo from '@/assets/devmeet_logo.png';

export default function DeveloperWonderland() {
  return (
    <section
      id="cta"
      style={{
        backgroundColor: '#000000',
        minHeight: '93vh',
        height: '92vh',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px 48px 24px',
        boxSizing: 'border-box',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* 1. Full-Width Dither Hands Reveal WebGL Canvas */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '112%',
          zIndex: 1
        }}
      >
        <DitherReveal
          image={roomImage}
          wave={false}
          dotSize={5}
          revealRadius={180}
          revealSoftness={50}
          ditherStyle="bayer8"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* 2. Top Floating Header & Action */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-default)',
              fontSize: 'clamp(26px, 3.2vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#ffffff',
              margin: 0,
              textShadow: '0 2px 20px rgba(0,0,0,0.9)'
            }}
          >
            Create Your First Room
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-default)',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.75)',
              margin: '6px 0 0',
              textShadow: '0 2px 10px rgba(0,0,0,0.9)'
            }}
          >
            Instant multiplayer coding, video calling, and AI evaluation in one click.
          </p>
        </div>

        <a
          href="#demo"
          className="btn-primary-green"
          style={{
            fontSize: '15px',
            fontWeight: 700,
            padding: '13px 30px',
            borderRadius: '0px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}
        >
          <span>Launch  Room</span>
          <ArrowUpRight size={17} />
        </a>
      </div>

      {/* 3. Column Footer — inside the section */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.72) 28%, rgba(0,0,0,0.88) 100%)',
          backdropFilter: 'blur(4px)',
          padding: '20px 48px 14px',
          boxSizing: 'border-box',
        }}
      >
        {/* Top row: columns */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '12px',
          }}
        >
          {/* Col 1 — Brand + tagline + socials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '60px' }}>
            <span style={{
              fontFamily: 'var(--font-default)',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.06em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}>
              DevMeet
            </span>
            <span style={{
              fontFamily: 'var(--font-default)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
              lineHeight: 1.5,
              maxWidth: '160px',
            }}>
              Multiplayer coding rooms for modern dev teams.
            </span>
            {/* Social icons — same as Footer.jsx */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {/* GitHub */}
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="DEVMEET GitHub" className="footer-social-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              {/* X (Twitter) */}
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="DEVMEET on X" className="footer-social-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="DEVMEET LinkedIn" className="footer-social-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              {/* Discord */}
              <a href="https://discord.com" target="_blank" rel="noreferrer" aria-label="DEVMEET Discord" className="footer-social-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Cols 2-4 grouped on the right */}
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>

            {/* Col 2 — Product */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{
                fontFamily: 'var(--font-default)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: '2px',
              }}>
                Product
              </span>
              {['Platform', 'Interactive Demo', 'AI Proctoring', 'Pricing'].map(link => (
                <a key={link} href="#"
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.45)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Col 3 — Developers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{
                fontFamily: 'var(--font-default)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: '2px',
              }}>
                Developers
              </span>
              {['Docs', 'API Reference', '404 Drift', 'Status'].map(link => (
                <a key={link} 
                  href={link === '404 Drift' ? '/404' : '#'}
                  onClick={link === '404 Drift' ? (e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/404');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  } : undefined}
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: link === '404 Drift' ? 'rgba(96, 165, 250, 0.7)' : 'rgba(255,255,255,0.45)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = link === '404 Drift' ? '#60a5fa' : '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.color = link === '404 Drift' ? 'rgba(96, 165, 250, 0.7)' : 'rgba(255,255,255,0.45)')}
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Col 4 — Company */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{
                fontFamily: 'var(--font-default)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: '2px',
              }}>
                Company
              </span>
              {['About', 'Blog', 'Careers', 'Privacy', 'Terms'].map(link => (
                <a key={link} href="#"
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.45)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                >
                  {link}
                </a>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom divider + copyright */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <span style={{
            fontFamily: 'var(--font-default)',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.02em',
          }}>
            © {new Date().getFullYear()} DevMeet, Inc. All rights reserved.
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.04em',
          }}>
            Built for developers.
          </span>
        </div>
      </div>

     
    </section>
  );
}
