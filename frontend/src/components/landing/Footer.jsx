"use client";

import React, { useState } from 'react';
import {
  ArrowUpRight,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Sparkles,
  ArrowUp,
  Check,
  Activity,
  Lock,
  Cpu,
  FileText
} from 'lucide-react';
import devmeetLogo from '@/assets/devmeet_logo.png';

export default function Footer() {
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setNewsletterEmail('');
      }, 3500);
    }
  };

  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Multiplayer IDE & Cursors', href: '#demo' },
        { label: 'AI Interview Companion', href: '#use-cases', badge: 'AI' },
        { label: 'On-Device AI Proctoring', href: '#security' },
        { label: 'Cloud MicroVM Sandboxes', href: '#demo', badge: 'v2.4' },
        { label: 'System Design Canvas', href: '#use-cases' }
      ]
    },
    {
      title: 'Solutions',
      links: [
        { label: 'Technical Hiring & Rubrics', href: '#pricing' },
        { label: 'Remote Engineering Teams', href: '#pricing' },
        { label: 'Open Source Mob Coding', href: '#demo' },
        { label: 'University Exams & Contests', href: '#use-cases' },
        { label: 'Enterprise Security & SSO', href: '#security' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Security Whitepaper (PDF)', href: '/BLANK_DEVMEET.pdf', isDownload: true, badge: 'PDF' },
        { label: 'SOC2 & GDPR Compliance', href: '#security' },
        { label: 'Global Latency Mesh', href: '#pricing', badge: '18ms' },
        { label: 'Pricing & Tiers', href: '#pricing' },
        { label: 'API & Webhook Docs', href: '#demo' }
      ]
    },
    {
      title: 'Company & Legal',
      links: [
        { label: 'Privacy Policy', href: '#security' },
        { label: 'Terms of Service', href: '#security' },
        { label: 'Security Overview', href: '#security' },
        { label: 'Contact Enterprise Sales', href: '#pricing' },
        { label: 'Brand Assets & Logo Kit', href: '/devmeet_logo.png' }
      ]
    }
  ];

  return (
    <footer
      style={{
        backgroundColor: '#050508',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Ambient Top Glow Effect */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(24, 119, 242, 0.12) 0%, rgba(24, 119, 242, 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
        {/* 1. Top Bar: Live Status & Developer Newsletter */}
        <div
          style={{
            padding: '28px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          {/* Status Indicator Button */}
          <button
            onClick={() => setBadgeModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              padding: '8px 18px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(24, 119, 242, 0.4)';
              e.currentTarget.style.backgroundColor = 'rgba(24, 119, 242, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
            }}
          >
            <span className="pulse-green-dot" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Operational <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span> 14 Global Regions (18ms avg)
            </span>
            <ArrowUpRight size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          </button>

          {/* Newsletter / Changelog Signup */}
          <form
            onSubmit={handleSubscribe}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px 12px',
                transition: 'border-color 0.2s ease'
              }}
            >
              <Terminal size={14} style={{ color: 'var(--color-accent-primary)', marginRight: '8px' }} />
              <input
                type="email"
                placeholder="developer@company.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  width: '210px'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: subscribed ? '#22c55e' : 'var(--color-accent-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'var(--font-default)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              {subscribed ? (
                <>
                  <Check size={14} />
                  <span>Subscribed</span>
                </>
              ) : (
                <span>Get Changelog</span>
              )}
            </button>
          </form>
        </div>

        {/* 2. Main Multi-Column Grid */}
        <div
          style={{
            padding: '64px 0 56px',
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '40px'
          }}
        >
          {/* Brand Summary Block (Left 4 cols on desktop) */}
          <div
            style={{
              gridColumn: 'span 12',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            className="footer-brand-col"
          >
            {/* Logo and Version Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={devmeetLogo}
                alt="DEVMEET"
                style={{
                  height: '36px',
                  width: 'auto',
                  objectFit: 'contain',
                  borderRadius: '50%'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontWeight: 900,
                    fontSize: '22px',
                    letterSpacing: '-0.03em',
                    color: '#ffffff'
                  }}
                >
                  DEV<span style={{ color: 'var(--color-accent-primary)' }}>MEET</span>
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-accent-primary)',
                  backgroundColor: 'rgba(24, 119, 242, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(24, 119, 242, 0.25)',
                  fontWeight: 600
                }}
              >
                v2.4.0
              </span>
            </div>

            {/* Tagline */}
            <p
              style={{
                fontFamily: 'var(--font-default)',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.65)',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '380px'
              }}
            >
              The multiplayer developer workspace for real-time pair programming, live AI interviewing, and on-device integrity proctoring.
            </p>

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <ShieldCheck size={12} style={{ color: '#22c55e' }} />
                <span>SOC2 Type II</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <Lock size={12} style={{ color: 'var(--color-accent-primary)' }} />
                <span>GDPR Ready</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <Cpu size={12} style={{ color: '#a855f7' }} />
                <span>MicroVM Sandboxes</span>
              </div>
            </div>
          </div>

          {/* Nav Columns (8 cols on desktop divided among 4 columns) */}
          <div
            style={{
              gridColumn: 'span 12',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '36px'
            }}
            className="footer-links-grid"
          >
            {columns.map((col, cIdx) => (
              <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.95)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ color: 'var(--color-accent-primary)' }}>/</span>
                  {col.title}
                </h4>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a
                        href={link.href}
                        download={link.isDownload ? 'DEVMEET_Security_Overview.pdf' : undefined}
                        className="footer-link-item"
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span
                            className="footer-link-badge"
                            style={{
                              backgroundColor:
                                link.badge === 'AI'
                                  ? 'rgba(168, 85, 247, 0.15)'
                                  : link.badge === 'PDF'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(24, 119, 242, 0.15)',
                              color:
                                link.badge === 'AI'
                                  ? '#c084fc'
                                  : link.badge === 'PDF'
                                  ? '#f87171'
                                  : 'var(--color-accent-primary)',
                              border: `1px solid ${
                                link.badge === 'AI'
                                  ? 'rgba(168, 85, 247, 0.3)'
                                  : link.badge === 'PDF'
                                  ? 'rgba(239, 68, 68, 0.3)'
                                  : 'rgba(24, 119, 242, 0.3)'
                              }`
                            }}
                          >
                            {link.badge}
                          </span>
                        )}
                        {link.isDownload && <FileText size={12} style={{ opacity: 0.6 }} />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Heroic Bottom Typographic Watermark */}
        <div
          style={{
            padding: '24px 0 12px',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <div
            className="footer-watermark-text"
            style={{
              fontSize: 'clamp(60px, 14.5vw, 210px)'
            }}
          >
            DEVMEET
          </div>
        </div>

        {/* 4. Bottom Legal, Social Bar & Back to Top */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '28px 0 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          {/* Left: Copyright */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
              © 2026 DEVMEET PLATFORM, INC. ALL RIGHTS RESERVED.
            </span>
            <span style={{ fontFamily: 'var(--font-default)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>
              Crafted with sub-millisecond precision for engineering teams.
            </span>
          </div>

          {/* Center/Right: Socials and Scroll-to-Top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="DEVMEET GitHub"
              className="footer-social-pill"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="DEVMEET on X"
              className="footer-social-pill"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="DEVMEET LinkedIn"
              className="footer-social-pill"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>

            {/* Discord */}
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              aria-label="DEVMEET Community Discord"
              className="footer-social-pill"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              aria-label="Back to Top"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.75)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginLeft: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
              }}
            >
              <span>TOP</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Global Status Modal */}
      {badgeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setBadgeModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#0a0d14',
              border: '1px solid rgba(24, 119, 242, 0.3)',
              borderRadius: '16px',
              padding: '36px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(24, 119, 242, 0.15)',
              color: '#ffffff',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22c55e'
                }}
              >
                <Activity size={22} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-default)',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: 0
                  }}
                >
                  Global Mesh Status
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span className="pulse-green-dot" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#22c55e' }}>
                    All 14 Media Nodes 100% Operational
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}
            >
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  AVG LATENCY (US-EAST)
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '4px 0 0' }}>
                  14.2 ms
                </p>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  AVG LATENCY (EU-CENTRAL)
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: '4px 0 0' }}>
                  18.8 ms
                </p>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  CRDT SYNC DRIFT
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: '#22c55e', margin: '4px 0 0' }}>
                  &lt; 1.0 ms
                </p>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  MICROVM PROVISION TIME
                </span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--color-accent-primary)', margin: '4px 0 0' }}>
                  280 ms
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, margin: '0 0 24px' }}>
              All audio/video SFU pipelines, on-device AI tab detection workers, and isolated microVM code runtimes are passing real-time health checks without packet loss.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setBadgeModalOpen(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'transparent',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Dismiss
              </button>
              <a
                href="#demo"
                onClick={() => setBadgeModalOpen(false)}
                className="btn-primary-green"
                style={{ fontSize: '13px', padding: '8px 18px' }}
              >
                Launch Sandbox Room
              </a>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
