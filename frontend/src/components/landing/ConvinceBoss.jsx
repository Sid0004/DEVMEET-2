"use client";

import React, { useState } from 'react';
import { Download, Copy, Check, ShieldCheck, Eye, Lock } from 'lucide-react';

export default function ConvinceBoss() {
  const [copied, setCopied] = useState(false);

  const securitySpecs = `DEVMEET Technical Interview & Proctoring Security Specification:
- On-Device Eye Tracking: Face Mesh & Gaze vectors computed locally in WebAssembly. No raw biometric video leaves the candidate browser.
- Tab-Switch & Copy-Paste Audit: Logs window blur events, paste entropy analysis (detecting LLM-generated blocks), and second monitor detection.
- End-to-End Encrypted Media: Hardware-accelerated DTLS-SRTP encryption for all in-room video and audio streams.
- Cloud Sandboxing: MicroVM isolation with strict memory and network air-gapping.
- Compliance: SOC2 Type II, GDPR, CCPA certified with automated data retention deletion policies.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(securitySpecs);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section id="security" className="gridline-horizontal" style={{ padding: '80px 0', backgroundColor: 'var(--color-canvas-default)' }}>
      <div className="container">
        <div
          style={{
            border: '1px solid var(--color-border-default)',
            borderRadius: '8px',
            padding: '48px 36px',
            backgroundColor: 'var(--color-canvas-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="var(--color-accent-primary)" />
              <span className="section-tag" style={{ margin: 0 }}>Enterprise Security &amp; Privacy</span>
            </div>
            <h2 className="section-title" style={{ fontSize: '36px', marginBottom: '16px' }}>
              Proctoring &amp; Integrity
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-fg-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              Conduct high-integrity technical interviews with confidence. DEVMEET&apos;s on-device eye tracking, tab monitoring, and anti-cheat checks protect assessment authenticity while strictly respecting candidate privacy.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="/BLANK_DEVMEET.pdf"
                download="DEVMEET_Overview.pdf"
                className="btn-primary-green"
                style={{ padding: '10px 18px', fontSize: '14px' }}
              >
                <Download size={16} />
                <span>Security Whitepaper (PDF)</span>
              </a>

              <button
                onClick={handleCopy}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '14px' }}
              >
                {copied ? <Check size={16} color="var(--color-accent-primary)" /> : <Copy size={16} />}
                <span>{copied ? 'Specs Copied!' : 'Copy Security Specs'}</span>
              </button>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '6px',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-fg-muted)' }}>
                <Lock size={14} />
                <span>devmeet_security_compliance.txt</span>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: copied ? 'var(--color-accent-primary)' : 'var(--color-fg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--color-fg-default)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                maxHeight: '260px',
                overflowY: 'auto'
              }}
            >
              {securitySpecs}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
