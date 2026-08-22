"use client";

import React, { useState } from 'react';
import { Play, Code, Video, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export default function Highlights2025() {
  const [selectedVideo, setSelectedVideo] = useState(0);

  const playlist = [
    {
      id: 'multiplayer',
      filename: 'multiplayer_editor.tsx',
      title: 'Zero-Latency Collaborative Editor Architecture',
      subtitle: 'Sub-millisecond CRDT sync across 50+ simultaneous cursors with syntax tree AST parsing.',
      badge: 'MULTIPLAYER IDE',
      thumbnail: '/registration/Thumbnail1.webp',
      description: 'DEVMEET uses lightweight conflict-free replicated data types (CRDTs) to guarantee zero desync between developers and interviewers across global peer networks.'
    },
    {
      id: 'copilot',
      filename: 'ai_interviewer_copilot.py',
      title: 'Real-Time AI Companion for Interviewers',
      subtitle: 'Live complexity estimation (Big-O) and context-aware follow-up question suggestions.',
      badge: 'AI COMPANION',
      thumbnail: '/registration/Thumbnail2.webp',
      description: 'The AI Companion silently analyzes candidate code in real-time, highlighting memory bottlenecks, edge cases, and suggesting targeted technical questions to the interviewer.'
    },
    {
      id: 'gaze',
      filename: 'gaze_tracking_security.wasm',
      title: 'On-Device AI Eye-Movement & Anti-Cheat Proctoring',
      subtitle: 'Computer vision face mesh running in client-side WebAssembly with zero biometric data leakage.',
      badge: 'AI PROCTORING',
      thumbnail: '/registration/Thumbnail3.webp',
      description: 'Continuously verifies candidate attention, monitors eye gaze vectors, logs second monitor / tab-switch events, and flags AI copy-pasting without recording sensitive private video.'
    },
    {
      id: 'sandbox',
      filename: 'cloud_microvm_sandbox.sh',
      title: 'Air-Gapped Cloud Execution MicroVMs',
      subtitle: 'Run Python, TypeScript, Rust, Go, Java, and C++ in isolated sub-second Linux containers.',
      badge: 'CLOUD SANDBOX',
      thumbnail: '/registration/Thumbnail4.webp',
      description: 'Execute arbitrary code securely with strict timeout limits, network air-gapping, memory controls, and full stdout/stderr streaming.'
    },
    {
      id: 'scorecard',
      filename: 'candidate_scorecard_report.json',
      title: 'Automated Post-Interview Hiring Scorecards',
      subtitle: 'Instant objective rubrics, test pass rates, and full keystroke code timeline replay.',
      badge: 'EVALUATION',
      thumbnail: '/registration/Thumbnail5.webp',
      description: 'Generate standardized hiring scorecards immediately after each interview. Share full interactive timeline replays with your hiring committee.'
    }
  ];

  const current = playlist[selectedVideo];

  return (
    <section id="videos" className="gridline-horizontal" style={{ padding: '80px 0', backgroundColor: 'var(--color-canvas-default)' }}>
      <div className="container">
        <div style={{ maxWidth: '800px', marginBottom: '40px' }}>
          <span className="section-tag">{'// platform deep dive'}</span>
          <h2 className="section-title">product-tour/</h2>
          <p style={{ fontSize: '16px', color: 'var(--color-fg-muted)', marginTop: '8px' }}>
            Explore the core architectural modules powering DEVMEET&apos;s real-time collaborative coding and proctoring engine.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            border: '1px solid var(--color-border-default)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'var(--color-canvas-default)'
          }}
        >
          {/* Left Column: Feature Playlist */}
          <div style={{ borderRight: '1px solid var(--color-border-default)', display: 'flex', flexDirection: 'column' }}>
            {playlist.map((item, idx) => {
              const isSelected = selectedVideo === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedVideo(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderBottom: idx < playlist.length - 1 ? '1px solid var(--color-border-default)' : 'none',
                    backgroundColor: isSelected ? 'var(--color-canvas-subtle)' : 'var(--color-canvas-default)',
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: 'var(--color-accent-primary)'
                      }}
                    />
                  )}

                  <div
                    style={{
                      width: '72px',
                      height: '42px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#0d1117',
                      flexShrink: 0,
                      position: 'relative',
                      border: '1px solid var(--color-border-default)'
                    }}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)'
                      }}
                    >
                      <Play size={12} color="#ffffff" fill="#ffffff" />
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--color-fg-default)' : 'var(--color-fg-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.filename}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-accent-primary)', marginTop: '2px', fontWeight: 600 }}>
                      {item.badge}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Video Showcase */}
          <div
            style={{
              padding: '32px',
              backgroundColor: '#000000',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              minHeight: '400px'
            }}
          >
            <div style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '20px' }}>
              <video
                key={current.id}
                src="/CFS/hero_sizzle.mp4"
                poster={current.thumbnail}
                controls
                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-accent-primary)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {current.badge}
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-default)', fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                {current.title}
              </h3>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent-subtle)', marginBottom: '12px' }}>
                {current.subtitle}
              </div>

              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                {current.description}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
