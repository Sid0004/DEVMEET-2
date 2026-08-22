"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, User, Menu, X } from 'lucide-react';
import devmeetLogo from '@/assets/devmeet_logo.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        if (window.lenis) {
          window.lenis.scrollTo(el, { offset: -70, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const navItems = [
    { label: 'Platform', href: '#river' },
    { label: 'Interactive Demo', href: '#demo' },
    { label: 'AI Proctoring', href: '#security' },
    { label: 'Use Cases', href: '#use-cases' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Docs', href: '#videos' }
  ];

  return (
    <header className={`navbar-sticky ${isScrolled ? 'shadow-sm' : ''}`} style={{ width: '100%', height: '70px', padding: 0 }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: 0 }}>
        {/* Left: DEVMEET Brand Logo */}
        <Link
          href="/"
          aria-label="DEVMEET Home"
          className="devmeet-brand-block"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: '0 28px',
            borderRight: '1px solid var(--color-border-default)',
            gap: '12px',
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
          <img
            src={devmeetLogo.src || '/devmeet_logo.png'}
            alt="DEVMEET"
            style={{ height: '36px', width: 'auto', display: 'block', objectFit: 'contain', borderRadius: '50%' }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontFamily: 'var(--font-default)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.035em', color: 'var(--color-fg-default)' }}>
              DEVMEET
            </span>
          </div>
        </Link>

        {/* Desktop Nav Section Blocks: Equal Width with Full-Height Dividers & No Gaps */}
        <nav className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', height: '100%', flex: 1 }}>
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="devmeet-nav-link"
            >
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Right: Integrated Full-Height Sign-In Cell + Solid CTA Block (Edge-to-Edge with No Gaps) */}
        <div className="desktop-nav-actions" style={{ display: 'flex', alignItems: 'center', height: '100%', flexShrink: 0 }}>
          <Link
            href="/login"
            className="devmeet-signin-link"
          >
            <span>Sign in</span>
            <User size={16} />
          </Link>

          <a
            href="#demo"
            onClick={(e) => handleNavClick(e, '#demo')}
            className="devmeet-cta-block"
          >
            <span>Try Room</span>
            <ArrowUpRight size={17} />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          style={{
            padding: '0 20px',
            height: '100%',
            color: 'var(--color-fg-default)',
            borderLeft: '1px solid var(--color-border-default)',
            background: 'transparent',
            marginLeft: 'auto'
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--color-canvas-default)',
            borderTop: '1px solid var(--color-border-default)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, item.href);
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '16px',
                fontWeight: 500,
                padding: '10px 0',
                borderBottom: '1px solid var(--color-border-subtle)'
              }}
            >
              {item.label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <a
              href="#demo"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, '#demo');
              }}
              className="btn-primary-green"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Start Free Room <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      )}

      <style>{`
        .devmeet-brand-block {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .devmeet-brand-block:hover {
          background-color: var(--color-canvas-subtle);
        }
        .devmeet-nav-link {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 12px;
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-fg-default) !important;
          border-right: 1px solid var(--color-border-default);
          position: relative;
          text-decoration: none;
          background-color: transparent;
          text-align: center;
          white-space: nowrap;
          z-index: 1;
          transition: background-color 0.15s ease, box-shadow 0.15s ease;
        }
        .devmeet-nav-link > span {
          display: inline-block;
          color: var(--color-fg-default) !important;
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .devmeet-nav-link:hover {
          z-index: 10;
          background-color: var(--color-canvas-subtle);
          color: var(--color-fg-default) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
        }
        .devmeet-nav-link:hover > span {
          transform: translateY(-1px);
          color: var(--color-fg-default) !important;
        }
        .devmeet-nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--color-accent-primary);
          box-shadow: 0 -1px 4px rgba(24, 119, 242, 0.35);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .devmeet-nav-link:hover::after {
          transform: scaleX(1);
        }

        .devmeet-signin-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 100%;
          padding: 0 24px;
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-fg-default) !important;
          border-left: 1px solid var(--color-border-default);
          border-right: 1px solid var(--color-border-default);
          text-decoration: none;
          background-color: transparent;
          transition: background-color 0.15s ease;
          position: relative;
          white-space: nowrap;
        }
        .devmeet-signin-link > span {
          color: var(--color-fg-default) !important;
        }
        .devmeet-signin-link:hover {
          background-color: var(--color-canvas-subtle);
          color: var(--color-fg-default) !important;
        }
        .devmeet-signin-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--color-accent-primary);
          box-shadow: 0 -1px 4px rgba(24, 119, 242, 0.35);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .devmeet-signin-link:hover::after {
          transform: scaleX(1);
        }

        .devmeet-cta-block {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 100%;
          padding: 0 32px;
          background-color: #0b0b0bff;
          color: #ffffff !important;
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: background-color 0.15s ease;
          border-left: 1px solid rgba(0,0,0,0.1);
          white-space: nowrap;
        }
        .devmeet-cta-block:hover {
          background-color: #0d65d9;
          color: #ffffff !important;
        }

        @media (max-width: 920px) {
          .desktop-nav-links, .desktop-nav-actions {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 921px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
