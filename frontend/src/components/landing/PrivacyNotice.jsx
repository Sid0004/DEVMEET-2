"use client";

import React, { useState, useEffect } from 'react';

export default function PrivacyNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('devmeet_cookie_consent');
      if (!consent) {
        setIsVisible(true);
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
            <a
              href="#privacy"
              style={{
                color: '#0969da',
                textDecoration: 'underline',
                fontWeight: 500
              }}
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {showManage && (
          <div
            style={{
              backgroundColor: '#f6f8fa',
              border: '1px solid #d0d7de',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2328' }}>Strictly Necessary</span>
                <p style={{ fontSize: '12px', color: '#656d76', margin: '2px 0 0 0' }}>Required for session & security.</p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2328' }}>Always Active</span>
            </div>

            <div style={{ borderTop: '1px solid #d0d7de', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2328' }}>Analytics & Performance</span>
                <p style={{ fontSize: '12px', color: '#656d76', margin: '2px 0 0 0' }}>Helps us improve platform reliability.</p>
              </div>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#1f2328', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            paddingTop: '4px'
          }}
        >
          <button
            onClick={() => setShowManage(!showManage)}
            style={{
              fontSize: '13px',
              color: '#656d76',
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: 'inherit'
            }}
          >
            {showManage ? 'Hide settings' : 'Manage cookies'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <button
              onClick={showManage ? handleSaveCustom : handleReject}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0d7de',
                color: '#1f2328',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f6f8fa')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
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
    </div>
  );
}
