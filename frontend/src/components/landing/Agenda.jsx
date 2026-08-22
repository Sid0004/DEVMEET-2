"use client";

import React, { useState } from 'react';
import {
  Code,
  Video,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowUpRight,
  Cpu,
  Layers,
  FileCheck,
  GitBranch,
  Bot,
  Trophy,
  Check
} from 'lucide-react';

export default function Agenda() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const useCases = [
    {
      id: 'interviews',
      label: 'Technical Interviews',
      sub: 'Algorithmic & Full-Stack',
      icon: Bot,
      features: [
        {
          title: 'Live AI Interviewer Companion',
          desc: "Get real-time hints and suggested follow-up questions tailored to the candidate's specific solution and complexity tradeoffs.",
          tag: 'AI Copilot',
          tagColor: '#8250df',
          icon: Sparkles,
          highlights: [
            'Real-time Big-O time & space complexity analysis',
            'Context-aware follow-up question suggestions',
            'Candidate approach categorization & tips'
          ]
        },
        {
          title: 'Automated Eye-Gaze & Proctoring',
          desc: 'On-device gaze tracking, tab-switch logging, and LLM copy-paste entropy detection to protect assessment integrity.',
          tag: 'Proctoring',
          tagColor: '#1877F2',
          icon: ShieldCheck,
          highlights: [
            'On-device computer vision models (zero latency)',
            'Multi-face & secondary monitor detection',
            'Full audio & key-cadence telemetry timeline'
          ]
        },
        {
          title: '1-Click Candidate Scorecards',
          desc: 'Instantly generate an objective post-interview rubric summary with full code replay playback for hiring committee reviews.',
          tag: 'Evaluation',
          tagColor: '#0969da',
          icon: FileCheck,
          highlights: [
            'Automated scoring against company rubric',
            'Interactive keystroke-by-keystroke code replay',
            'Exportable PDF & ATS integration webhook'
          ]
        }
      ]
    },
    {
      id: 'pairing',
      label: 'Pair Programming',
      sub: 'Mob Coding & Bug Hunts',
      icon: Code,
      features: [
        {
          title: 'Zero-Latency Multiplayer Cursors',
          desc: 'CRDT-backed collaborative editor lets 50+ developers edit, select, and review files simultaneously without race conditions.',
          tag: 'Multiplayer',
          tagColor: '#1877F2',
          icon: Users,
          highlights: [
            'Sub-millisecond Yjs CRDT synchronization',
            'Live presence avatars and follow-mode',
            'Multi-file tab switching & split views'
          ]
        },
        {
          title: 'Embedded HD Video & Live Chat',
          desc: 'Built-in crystal clear video, multi-speaker voice, and rich markdown chat with syntax highlighting eliminate third-party tools.',
          tag: 'Video & Chat',
          tagColor: '#bf8700',
          icon: Video,
          highlights: [
            'AI background noise-cancellation',
            'In-room markdown & snippet messaging',
            'Low-bandwidth screen & canvas sharing'
          ]
        },
        {
          title: 'Direct GitHub Sync & PR Creation',
          desc: 'Clone any public or private GitHub repository directly into a DEVMEET sandbox and commit changes in one click.',
          tag: 'Git Sync',
          tagColor: '#8250df',
          icon: GitBranch,
          highlights: [
            'Branch switching & diff review mode',
            'Direct commit & GitHub PR generation',
            'Containerized execution for 40+ languages'
          ]
        }
      ]
    },
    {
      id: 'whiteboard',
      label: 'System Design',
      sub: 'Architecture & Diagrams',
      icon: Layers,
      features: [
        {
          title: 'Multiplayer Architecture Canvas',
          desc: 'Collaborative infinite whiteboard with pre-built cloud architecture stencils (AWS, GCP, Kubernetes, Kafka, DBs).',
          tag: 'Whiteboard',
          tagColor: '#0969da',
          icon: Layers,
          highlights: [
            'Pre-loaded AWS, GCP & system design stencils',
            'Real-time multi-pointer drawing & connectors',
            'Export high-res SVG & PNG diagrams'
          ]
        },
        {
          title: 'Live Capacity & Throughput Estimator',
          desc: 'Interactive formula tools for calculating QPS, bandwidth, and storage capacity requirements during system design interviews.',
          tag: 'Calculators',
          tagColor: '#8250df',
          icon: Cpu,
          highlights: [
            'Automated QPS & peak load calculators',
            'Storage & RAM dimensioning scratchpad',
            'Shared real-time calculation notes'
          ]
        }
      ]
    },
    {
      id: 'exams',
      label: 'Exams & Hackathons',
      sub: 'Assessments & Squad Events',
      icon: Trophy,
      features: [
        {
          title: 'Secure Proctored Coding Exams',
          desc: 'Timed coding assessments with lock-down browser modes, anti-cheat AI logs, and automated test suite grading.',
          tag: 'Exams',
          tagColor: '#1a7f37',
          icon: ShieldCheck,
          highlights: [
            'Full-screen lock-down & blur detection',
            'Automated test runner & memory profiler',
            'Instant batch test case evaluation'
          ]
        },
        {
          title: 'Squad Breakouts & Mentor Drop-In',
          desc: 'Hackathon teams can code in private rooms while mentors and judges drop in on video calls to provide real-time feedback.',
          tag: 'Hackathons',
          tagColor: '#bf8700',
          icon: Users,
          highlights: [
            'Instant squad sub-room generation',
            'Judge & mentor broadcast announcements',
            'Final project live presentation stage'
          ]
        }
      ]
    }
  ];

  return (
    <section
      id="use-cases"
      style={{
        padding: '80px 24px',
        backgroundColor: 'var(--color-canvas-default)',
        borderBottom: 'none'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}
      >
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Built for Every Workflow
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-default)',
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--color-fg-default)',
                margin: 0,
                letterSpacing: '-0.02em'
              }}
            >
              Platform Modes
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-default)',
                fontSize: '15px',
                color: 'var(--color-fg-muted)',
                margin: '8px 0 0',
                maxWidth: '620px',
                lineHeight: 1.6
              }}
            >
              One unified room designed for technical interviews, remote pair coding, system design rounds, and university exams.
            </p>
          </div>

          <a
            href="#cta"
            className="btn-secondary"
            style={{
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--color-border-default)',
              backgroundColor: '#ffffff',
              color: 'var(--color-fg-default)',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            Launch Room <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Segmented Mode Navigation Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '8px',
            padding: '4px',
            backgroundColor: 'var(--color-canvas-subtle)',
            border: '1px solid var(--color-border-default)',
            borderRadius: '8px'
          }}
        >
          {useCases.map((uc, idx) => {
            const isActive = activeTab === idx;
            const Icon = uc.icon;
            return (
              <button
                key={uc.id}
                onClick={() => setActiveTab(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  border: isActive ? '1px solid var(--color-border-default)' : '1px solid transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 0.18s ease',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: isActive ? 'rgba(24, 119, 242, 0.1)' : 'rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: isActive ? 'var(--color-accent-primary)' : 'var(--color-fg-muted)'
                  }}
                >
                  <Icon size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-default)',
                      fontSize: '14px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--color-fg-default)' : 'var(--color-fg-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {uc.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--color-fg-muted)',
                      opacity: 0.8,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {uc.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feature Cards Grid matching FeaturesWhy card style */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${useCases[activeTab].features.length === 2 ? '420px' : '320px'}, 1fr))`,
            gap: '16px'
          }}
        >
          {useCases[activeTab].features.map((feat, idx) => {
            const Icon = feat.icon;
            const isHovered = hoveredCard === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: isHovered ? '#f0fff4' : '#ffffff',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: '6px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  transition: 'background-color 0.2s ease',
                  cursor: 'default'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Top Badge & Icon */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: feat.tagColor,
                        backgroundColor: 'var(--color-canvas-subtle)',
                        border: '1px solid var(--color-border-default)',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {feat.tag}
                    </span>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-canvas-subtle)',
                        border: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: feat.tagColor
                      }}
                    >
                      <Icon size={14} />
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-default)',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'var(--color-fg-default)',
                        margin: '0 0 8px 0'
                      }}
                    >
                      {feat.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--font-default)',
                        fontSize: '14px',
                        color: 'var(--color-fg-muted)',
                        lineHeight: 1.6,
                        margin: 0
                      }}
                    >
                      {feat.desc}
                    </p>
                  </div>
                </div>

                {/* Checklist Bullet Points */}
                <ul
                  style={{
                    listStyle: 'none',
                    padding: '12px 0 0',
                    margin: 0,
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  {feat.highlights.map((hl, hIdx) => (
                    <li
                      key={hIdx}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: '#333333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Check size={13} style={{ color: feat.tagColor, flexShrink: 0, strokeWidth: 2.5 }} />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
