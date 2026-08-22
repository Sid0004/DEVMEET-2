"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import BlockDrift from './originkit/block-drift';

export default function NotFound({ onNavigateHome, reason }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReturn = (e) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Determine status message: connection lost vs wrong path 404
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isConnectionIssue = reason === 'connection' || isOffline || path.includes('login') || path.includes('offline') || path.includes('disconnected');
  const statusLabel = isConnectionIssue
    ? 'connection lost // server unreachable'
    : '404 // page not found';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        overflow: 'hidden',
        fontFamily: 'var(--font-default, "Mona Sans", sans-serif)',
        userSelect: 'none',
      }}
    >
      {/* 3D WebGL Block Drift Canvas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <BlockDrift
          near="#929292"
          far="#0a0a0a"
          edge="#242424"
          grid={11}
          blockSize={10}
          gap={20}
          layers={15}
          density={11}
          cluster={1.1}
          edgeWidth={1}
          fade={1.4}
          shade={18}
          clearCentre={2}
          speed={2.0}
          direction="front"
          driftText=""
          driftTextColor="#ffffff"
          driftFont='600 112px "Mona Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          driftLetterSpacing="20px"
        />
      </div>

      {/* Bottom Left: 'get me back' button & subtle status snippet */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '32px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <a
          href="/"
          onClick={handleReturn}
          className="get-back-btn"
          style={{
            fontSize: '13px',
            fontFamily: 'var(--font-default, "Mona Sans", sans-serif)',
            color: '#e5e7eb',
            textDecoration: 'none',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '0px',
            padding: '10px 18px',
            letterSpacing: '0.02em',
            backgroundColor: 'rgba(8, 8, 8, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span className="btn-arrow" style={{ display: 'inline-flex', transition: 'transform 0.2s ease' }}>
            <ArrowLeft size={15} strokeWidth={2.2} />
          </span>
          <span style={{ fontWeight: 600 }}>get me back</span>
        </a>

        {/* Small Status Snippet */}
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.45)',
            letterSpacing: '0.03em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            paddingLeft: '2px',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: isConnectionIssue ? '#f59e0b' : '#ef4444',
              display: 'inline-block',
              boxShadow: isConnectionIssue ? '0 0 8px rgba(245, 158, 11, 0.6)' : '0 0 8px rgba(239, 68, 68, 0.6)',
            }}
          />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Interactive Micro-Hover Styles */}
      <style>{`
        .get-back-btn:hover {
          border-color: #1877F2 !important;
          background-color: #1877F2 !important;
          color: #ffffff !important;
          transform: translateY(-2px);
          box-shadow: none !important;
        }
        .get-back-btn:hover .btn-arrow {
          transform: translateX(-4px);
        }
        .get-back-btn:active {
          transform: translateY(0);
          background-color: #0d65d9 !important;
          border-color: #0d65d9 !important;
        }
      `}</style>
    </div>
  );
}
