"use client";

import React, { useState, useEffect } from 'react';
import LegalModal from '@/components/LegalModal';

export default function PrivacyNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('devmeet_cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        'devmeet_cookie_consent',
        JSON.stringify({ analytics: true, essential: true, date: new Date().toISOString() })
      );
    } catch (e) {}
    setIsVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem(
        'devmeet_cookie_consent',
        JSON.stringify({ analytics: false, essential: true, date: new Date().toISOString() })
      );
    } catch (e) {}
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    try {
      localStorage.setItem(
        'devmeet_cookie_consent',
        JSON.stringify({ analytics: analyticsEnabled, essential: true, date: new Date().toISOString() })
      );
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        maxWidth: '480px',
        width: 'calc(100vw - 48px)',
        zIndex: 9999,
        backgroundColor: '#ffffff',
        border: '1px solid #d0d7de',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(140, 149, 159, 0.2)',
        padding: '20px 24px',
        color: '#1f2328',
        fontFamily: 'var(--font-default, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1f2328',
              margin: '0 0 6px 0',
              lineHeight: 1.3
            }}
          >
            We use cookies
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: '#656d76',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            We use cookies and similar technologies to help personalize content, tailor and measure performance, and provide a better experience.{' '}
            <button
              type="button"
              onClick={() => setLegalModalOpen(true)}
              style={{
                color: '#0969da',
                textDecoration: 'underline',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                cursor: 'pointer',
                display: 'inline'
              }}
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>

        {showManage && (
          <div
            style={{
              backgroundColor: '#f6f8fa',
              border: '1px solid #d0d7de',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#1f2328'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <span style={{ fontWeight: 600 }}>Essential Cookies</span>
                <span style={{ color: '#656d76', display: 'block', fontSize: '11px' }}>Required for authentication and system security.</span>
              </div>
              <span style={{ fontSize: '11px', color: '#656d76', fontStyle: 'italic' }}>Always Active</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e1e4e8' }}>
              <div>
                <span style={{ fontWeight: 600 }}>Analytics &amp; Performance</span>
                <span style={{ color: '#656d76', display: 'block', fontSize: '11px' }}>Helps us measure latency and room reliability.</span>
              </div>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: '#0969da' }}
              />
            </div>
          </div>
        )}

        {/* Buttons Action Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => setShowManage(!showManage)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#0969da',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 0',
              textDecoration: 'underline'
            }}
          >
            {showManage ? 'Hide details' : 'Manage cookies'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={showManage ? handleSaveCustom : handleRejectNonEssential}
              style={{
                backgroundColor: '#f6f8fa',
                border: '1px solid #d0d7de',
                color: '#1f2328',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eaeef2')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f6f8fa')}
            >
              {showManage ? 'Save preferences' : 'Reject non-essential'}
            </button>

            <button
              onClick={handleAcceptAll}
              style={{
                backgroundColor: '#1f2328',
                border: '1px solid #1f2328',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#000000')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1f2328')}
            >
              Accept all
            </button>
          </div>
        </div>
      </div>

      {/* Embedded In-App Privacy & Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        initialTab="privacy"
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
}
