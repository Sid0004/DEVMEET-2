"use client";

import React, { useState } from 'react';
import { Play, RotateCcw, Video, VideoOff, Mic, MicOff, Eye, ShieldCheck, Sparkles, Terminal, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export default function InteractiveSandbox() {
  const [mode, setMode] = useState('interview'); // 'interview' | 'pair'
  const [videoActive, setVideoActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState('Tests passed: 4/4 | Runtime: 12ms | Memory: 14.2 MB');
  const [eyeTrackingStatus, setEyeTrackingStatus] = useState('normal'); // 'normal' | 'lookaway'

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTerminalOutput(`⚡ Running tests on Python 3.12 microVM...\n✓ test_two_sum_positive [0.002s]\n✓ test_two_sum_negative [0.001s]\n✓ test_large_array_100k [0.012s]\n\nResult: 100% Passed. Time Complexity: O(N), Space Complexity: O(N)`);
    }, 600);
  };

  const simulateLookAway = () => {
    setEyeTrackingStatus(prev => (prev === 'normal' ? 'lookaway' : 'normal'));
  };

  return (
    <section id="demo" className="gridline-horizontal" style={{ padding: '80px 0', backgroundColor: 'var(--color-canvas-subtle)' }}>
      <div className="container">
        {/* Section Heading */}
        <div style={{ maxWidth: '800px', marginBottom: '40px' }}>
          <span className="section-tag">// live interactive room simulator</span>
          <h2 className="section-title">
            Test drive the DEVMEET experience
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-fg-muted)', marginTop: '8px' }}>
            Experience how the collaborative IDE, low-latency video calling, AI proctoring, and interviewer companion interact in real-time.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setMode('interview')}
            className={mode === 'interview' ? 'btn-primary-green' : 'btn-secondary'}
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            <Sparkles size={16} />
            <span>AI Interview Mode</span>
          </button>

          <button
            onClick={() => setMode('pair')}
            className={mode === 'pair' ? 'btn-primary-green' : 'btn-secondary'}
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            <Users size={16} />
            <span>Team Pair Coding Mode</span>
          </button>
        </div>

        {/* Interactive Sandbox Room Window */}
        <div
          style={{
            backgroundColor: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}
        >
          {/* Room Top Header Bar */}
          <div
            style={{
              backgroundColor: '#161b22',
              padding: '12px 20px',
              borderBottom: '1px solid #30363d',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ff5f56', display: 'inline-block' }}></span>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ffbd2e', display: 'inline-block' }}></span>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#27c93f', display: 'inline-block' }}></span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#c9d1d9', fontWeight: 600 }}>
                {mode === 'interview' ? 'Room #INT-904 (Senior Frontend Engineer Assessment)' : 'Room #PAIR-402 (Core API Refactoring Sprint)'}
              </span>
            </div>

            {/* Controls Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {mode === 'interview' && (
                <button
                  onClick={simulateLookAway}
                  style={{
                    backgroundColor: eyeTrackingStatus === 'normal' ? 'rgba(8, 135, 43, 0.2)' : 'rgba(207, 34, 46, 0.2)',
                    border: eyeTrackingStatus === 'normal' ? '1px solid #2da44e' : '1px solid #f85149',
                    color: eyeTrackingStatus === 'normal' ? '#3fb950' : '#f85149',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={13} />
                  <span>{eyeTrackingStatus === 'normal' ? '👁️ Gaze: Centered' : '⚠️ Gaze: Looking Away Flagged'}</span>
                </button>
              )}

              <button
                onClick={() => setVideoActive(!videoActive)}
                style={{
                  backgroundColor: videoActive ? '#21262d' : '#da3633',
                  color: '#ffffff',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #30363d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                {videoActive ? <Video size={14} /> : <VideoOff size={14} />}
              </button>

              <button
                onClick={() => setMicActive(!micActive)}
                style={{
                  backgroundColor: micActive ? '#21262d' : '#da3633',
                  color: '#ffffff',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #30363d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                {micActive ? <Mic size={14} /> : <MicOff size={14} />}
              </button>

              <button
                onClick={runCode}
                disabled={isRunning}
                style={{
                  backgroundColor: '#1877F2',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Play size={13} fill="#ffffff" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* Main Sandbox Grid: Editor (Left) + Video & AI Companion (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: '440px' }}>
            
            {/* Editor Area */}
            <div style={{ borderRight: '1px solid #30363d', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7, color: '#c9d1d9' }}>
                <div style={{ color: '#8b949e', marginBottom: '8px' }}>// DEVMEET Real-Time Multi-Cursor IDE</div>
                <div><span style={{ color: '#ff7b72' }}>import</span> {'{'} useMemo, useCallback {'}'} <span style={{ color: '#ff7b72' }}>from</span> <span style={{ color: '#a5d6ff' }}>'react'</span>;</div>
                <br />
                <div><span style={{ color: '#ff7b72' }}>export function</span> <span style={{ color: '#d2a8ff' }}>calculateOptimizedState</span>(items: <span style={{ color: '#79c0ff' }}>Item[]</span>) {'{'}</div>
                <div style={{ paddingLeft: '20px' }}>
                  <span style={{ color: '#ff7b72' }}>const</span> map = <span style={{ color: '#ff7b72' }}>new</span> <span style={{ color: '#79c0ff' }}>Map</span>&lt;<span style={{ color: '#79c0ff' }}>string, number</span>&gt;();
                </div>
                <div style={{ paddingLeft: '20px', position: 'relative' }}>
                  <span style={{ color: '#ff7b72' }}>for</span> (<span style={{ color: '#ff7b72' }}>const</span> item <span style={{ color: '#ff7b72' }}>of</span> items) {'{'}
                  <span
                    style={{
                      backgroundColor: '#1f6feb',
                      color: '#ffffff',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      marginLeft: '10px'
                    }}
                  >
                    Alex (Staff Dev) ✍️
                  </span>
                </div>
                <div style={{ paddingLeft: '40px' }}>
                  map.set(item.id, (map.get(item.id) ?? <span style={{ color: '#79c0ff' }}>0</span>) + item.weight);
                </div>
                <div style={{ paddingLeft: '20px' }}>{'}'}</div>
                <div style={{ paddingLeft: '20px' }}><span style={{ color: '#ff7b72' }}>return</span> <span style={{ color: '#79c0ff' }}>Array</span>.from(map.entries());</div>
                <div>{'}'}</div>
              </div>

              {/* Mini Terminal Output */}
              <div
                style={{
                  marginTop: '20px',
                  backgroundColor: '#010409',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#58a6ff'
                }}
              >
                <div style={{ color: '#8b949e', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>TERMINAL OUTPUT (Python 3.12 / Linux Sandbox)</span>
                  <span style={{ color: '#3fb950' }}>● Sandbox Active</span>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', color: '#7ee787' }}>{terminalOutput}</pre>
              </div>
            </div>

            {/* Right Side: Live Video Stream & AI Interview Companion Box */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#0d1117' }}>
              
              {/* WebRTC Video Stream Simulator */}
              <div
                style={{
                  backgroundColor: '#161b22',
                  borderRadius: '8px',
                  border: '1px solid #30363d',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#8b949e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={13} color="#3fb950" /> Live HD Video Call (2 participants)
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#58a6ff' }}>1080p • 18ms</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* Candidate Feed */}
                  <div
                    style={{
                      backgroundColor: '#010409',
                      height: '110px',
                      borderRadius: '6px',
                      border: eyeTrackingStatus === 'normal' ? '1px solid #238636' : '1px solid #da3633',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#8250df', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 700 }}>
                      SC
                    </div>
                    <div style={{ position: 'absolute', bottom: '6px', left: '8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px' }}>
                      Sarah (Candidate)
                    </div>
                    {/* Bounding Box overlay */}
                    <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '10px', color: eyeTrackingStatus === 'normal' ? '#3fb950' : '#f85149', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {eyeTrackingStatus === 'normal' ? '✓ Gaze OK' : '⚠️ Alert'}
                    </div>
                  </div>

                  {/* Interviewer Feed */}
                  <div
                    style={{
                      backgroundColor: '#010409',
                      height: '110px',
                      borderRadius: '6px',
                      border: '1px solid #30363d',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1f6feb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 700 }}>
                      MV
                    </div>
                    <div style={{ position: 'absolute', bottom: '6px', left: '8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '3px' }}>
                      Marcus (Interviewer)
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Interview Companion Real-Time Analysis */}
              <div
                style={{
                  backgroundColor: 'rgba(130, 80, 223, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(130, 80, 223, 0.35)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d2a8ff', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
                    <Sparkles size={14} />
                    <span>AI Interviewer Companion (Live)</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#8b949e' }}>Confidence: 96%</span>
                </div>

                <div style={{ fontFamily: 'var(--font-default)', fontSize: '13px', color: '#e6edf3', lineHeight: 1.5 }}>
                  {mode === 'interview' ? (
                    <>
                      <strong>Code Analysis:</strong> Candidate implemented an optimal single-pass hash map algorithm (O(N) runtime, O(N) space).
                      <br /><br />
                      <strong>Suggested Follow-up:</strong> <em>"Ask the candidate how this logic scales if the items array contains 100 million entries and does not fit in RAM."</em>
                    </>
                  ) : (
                    <>
                      <strong>Pair Programming Insight:</strong> No memory leaks detected in useMemo closure. Type definitions match backend OpenAPI spec.
                    </>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
