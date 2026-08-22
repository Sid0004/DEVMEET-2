"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronUp, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

export default function Tickets() {
  const [focusedPlan, setFocusedPlan] = useState('pro');
  const [openAccordions, setOpenAccordions] = useState({ free: true, pro: true, enterprise: true });

  const toggleAccordion = (e, key) => {
    e.stopPropagation();
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="pricing" className="gridline-horizontal" style={{ padding: '80px 0', backgroundColor: 'var(--color-canvas-default)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '800px', marginBottom: '40px' }}>
          
          <h2 className="section-title" style={{ marginBottom: '16px' }}>
            Choose your plan
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--color-fg-muted)' }}>
            Start for free with unlimited pair programming rooms, or unlock AI Interviewer Companion and Eye-Tracking Proctoring for technical hiring.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          
          {/* Free Tier */}
          <div
            onMouseEnter={() => setFocusedPlan('free')}
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              border: focusedPlan === 'free' ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)',
              borderRadius: '8px',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-canvas-subtle)',
                    color: 'var(--color-fg-default)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  FOR INDIVIDUAL DEVS
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-fg-muted)' }}>
                  Pair Programming
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, margin: '8px 0' }}>
                community/
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-fg-muted)', marginBottom: '20px' }}>
                Unlimited instant pair programming rooms with collaborative code editing, terminal execution, and HD in-room video.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '24px' }}>
                <span style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em' }}>$0</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-fg-muted)' }}>free forever</span>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px', marginBottom: '24px' }}>
                <button
                  onClick={(e) => toggleAccordion(e, 'free')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-fg-default)'
                  }}
                >
                  <span>Included features</span>
                  {openAccordions.free ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openAccordions.free && (
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
                    {[
                      'Unlimited 1-on-1 collaborative coding rooms',
                      'Multiplayer live cursors & syntax highlighting (40+ languages)',
                      'Built-in 1080p HD video, audio & live markdown code chat',
                      '100 cloud terminal executions per day',
                      'GitHub repository import & branch sync'
                    ].map((perk, i) => (
                      <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--color-fg-muted)', marginBottom: '10px' }}>
                        <Check size={16} color="var(--color-accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Link
              href="/login"
              className={focusedPlan === 'free' ? 'btn-primary-green' : 'btn-secondary'}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', textDecoration: 'none' }}
            >
              Start Free Room <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Pro Interviewer Tier (Featured) */}
          <div
            onMouseEnter={() => setFocusedPlan('pro')}
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              border: focusedPlan === 'pro' ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)',
              borderRadius: '8px',
              padding: '32px 28px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  MOST POPULAR
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-fg-muted)' }}>
                  Technical Hiring
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, margin: '8px 0' }}>
                pro-interviewer/
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-fg-muted)', marginBottom: '20px' }}>
                Supercharged for engineering managers and technical interviewers. Includes AI Interview Companion and AI Eye-Tracking integrity checks.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '24px' }}>
                <span style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em' }}>$29</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-fg-muted)' }}>USD / month</span>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px', marginBottom: '24px' }}>
                <button
                  onClick={(e) => toggleAccordion(e, 'pro')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-fg-default)'
                  }}
                >
                  <span>Included features</span>
                  {openAccordions.pro ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openAccordions.pro && (
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
                    {[
                      'Everything in Free, plus:',
                      'AI Interviewer Companion: Live follow-up prompts & complexity checks',
                      'On-Device AI Eye-Movement & Tab-Switch Proctoring HUD',
                      'Unlimited high-speed cloud Linux terminal executions',
                      'Session audio/video recording & full code replay timeline',
                      'Automated post-interview scorecard & rubric export'
                    ].map((perk, i) => (
                      <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--color-fg-muted)', marginBottom: '10px' }}>
                        <Check size={16} color="var(--color-accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Link
              href="/login"
              className={focusedPlan === 'pro' ? 'btn-primary-green' : 'btn-secondary'}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', textDecoration: 'none' }}
            >
              Start 14-Day Pro Trial <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Enterprise Security Tier */}
          <div
            onMouseEnter={() => setFocusedPlan('enterprise')}
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              border: focusedPlan === 'enterprise' ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)',
              borderRadius: '8px',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(130, 80, 223, 0.1)',
                    color: 'var(--color-purple, #8250df)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  SCALE &amp; SECURITY
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-fg-muted)' }}>
                  Enterprise
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, margin: '8px 0' }}>
                enterprise/
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-fg-muted)', marginBottom: '20px' }}>
                Enterprise grade governance, SSO / SAML integration, custom proctoring thresholds, and dedicated private cloud clusters.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '24px' }}>
                <span style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.03em' }}>$99</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-fg-muted)' }}>USD / seat / mo</span>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px', marginBottom: '24px' }}>
                <button
                  onClick={(e) => toggleAccordion(e, 'enterprise')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-fg-default)'
                  }}
                >
                  <span>Included features</span>
                  {openAccordions.enterprise ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {openAccordions.enterprise && (
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
                    {[
                      'Everything in Pro, plus:',
                      'SSO / SAML (Okta, Azure AD, Google Workspace)',
                      'Custom AI interview question banks & company rubrics',
                      'SOC2 Type II & GDPR compliance reports',
                      'Dedicated low-latency global media relay & 99.99% SLA',
                      'ATS integrations (Greenhouse, Lever, Ashby)'
                    ].map((perk, i) => (
                      <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--color-fg-muted)', marginBottom: '10px' }}>
                        <Check size={16} color="var(--color-purple, #8250df)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <a
              href="#convince"
              className={focusedPlan === 'enterprise' ? 'btn-primary-green' : 'btn-secondary'}
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              Contact Enterprise Sales <ArrowUpRight size={16} />
            </a>
          </div>

        </div>

        {/* Add-on Modules */}
        {/* <div style={{ borderTop: '1px solid var(--color-border-default)', paddingTop: '32px' }}>
          <span className="section-tag">// optional add-ons</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
            
            <div style={{ padding: '20px', backgroundColor: 'var(--color-canvas-default)', border: '1px solid var(--color-border-default)', borderRadius: '6px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--color-accent-primary)', marginBottom: '6px' }}>
                ats-integration-pack/
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-fg-muted)', marginBottom: '12px' }}>
                Direct 1-click sync with Greenhouse, Lever, and Ashby candidate pipelines.
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>+$49 / mo</div>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--color-canvas-default)', border: '1px solid var(--color-border-default)', borderRadius: '6px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--color-purple)', marginBottom: '6px' }}>
                gpu-sandbox-nodes/
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-fg-muted)', marginBottom: '12px' }}>
                Dedicated Nvidia H100/A100 cloud execution nodes for PyTorch & ML coding rounds.
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>+$99 / mo</div>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--color-canvas-default)', border: '1px solid var(--color-border-default)', borderRadius: '6px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '6px' }}>
                custom-domain-branding/
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-fg-muted)', marginBottom: '12px' }}>
                Host DEVMEET rooms on your own domain (e.g., code.yourcompany.com).
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>+$29 / mo</div>
            </div>

          </div>
        </div> */}

      </div>
    </section>
  );
}
