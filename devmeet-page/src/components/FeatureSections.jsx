import React from 'react';
import { EyeTracking } from './ui/eye-tracking';
export function DeveloperSection() {
  return (
    <section style={{
      width: '100%',
      minHeight: '90vh',
      padding: '96px 64px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: '#101010',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '5fr 7fr',
        gap: '80px',
        alignItems: 'center',
      }}>

        {/* Text Content - Left */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#4a4a4a',
            marginBottom: '20px',
          }}>
            01 / Collaboration Mode
          </span>

          <h2 style={{
            fontSize: '52px',
            fontWeight: 300,
            color: '#f0f0f0',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
          }}>
            Pair programming without limits.
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#6a6a6a',
            lineHeight: 1.75,
            marginBottom: '44px',
          }}>
            An open workspace designed for active engineering teams. All participants have equal
            edit permissions, can create files, run code, and co-author features simultaneously.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Real-time multi-cursor editing',
              'Native embedded chat & voice',
              'Instant link sharing',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12.5px',
                  color: '#b0b0b0',
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Content - Right */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', paddingBottom: '60px' }}>

          {/* Editor Card */}
          <div style={{
            width: '100%',
            maxWidth: '580px',
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
            {/* Top Bar */}
            <div style={{
              height: '48px',
              background: '#0f0f0f',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: '8px',
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                color: '#505050',
                flex: 1,
              }}>App.tsx</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(239,68,68,0.35)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(234,179,8,0.35)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(34,197,94,0.35)' }} />
              </div>
            </div>

            {/* Code Body */}
            <div style={{
              padding: '28px 32px 36px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              lineHeight: 2,
              position: 'relative',
            }}>
              <p>
                <span style={{ color: '#7ba3e0' }}>export function</span>{' '}
                <span style={{ color: '#c8a8f0' }}>Collaboration</span>
                <span style={{ color: '#d4d4d4' }}>() {'{'}</span>
              </p>
              <p style={{ paddingLeft: '24px', color: '#888' }}>
                <span style={{ color: '#7ba3e0' }}>const</span>{' '}
                workspace = <span style={{ color: '#c8a8f0' }}>useWorkspace</span>();
              </p>
              <p style={{ paddingLeft: '24px', color: '#3a3a3a' }}>// Start collaboration engine</p>
              <p style={{ paddingLeft: '24px' }}>
                <span style={{ color: '#7ba3e0' }}>return</span>{' '}
                <span style={{ color: '#d4d4d4' }}>(</span>
              </p>
              <p style={{ paddingLeft: '48px' }}>
                <span style={{ color: '#d4d4d4' }}>&lt;</span>
                <span style={{ color: '#c8a8f0' }}>Editor</span>
              </p>
              <p style={{ paddingLeft: '64px' }}>
                <span style={{ color: '#85c5a8' }}>participants</span>
                <span style={{ color: '#d4d4d4' }}>={'{'}</span>
                <span style={{ color: '#e88a6a' }}>workspace.users</span>
                <span style={{ color: '#d4d4d4' }}>{'}'}</span>
              </p>
              <p style={{ paddingLeft: '64px' }}>
                <span style={{ color: '#85c5a8' }}>realTimeSync</span>
                <span style={{ color: '#d4d4d4' }}>={'{'}</span>
                <span style={{ color: '#e88a6a' }}>true</span>
                <span style={{ color: '#d4d4d4' }}>{'}'}</span>
              </p>
              <p style={{ paddingLeft: '48px', color: '#d4d4d4' }}>/&gt;</p>
              <p style={{ paddingLeft: '24px', color: '#d4d4d4' }}>);</p>
              <p style={{ color: '#d4d4d4' }}>{'}'}</p>

              {/* Cursor Badge */}
              <div style={{
                position: 'absolute',
                top: '112px',
                right: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                animation: 'cursorPulse 2.5s ease-in-out infinite',
              }}>
                <style>{`@keyframes cursorPulse { 0%,100%{opacity:1} 50%{opacity:0.35} } @keyframes onlinePulse { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
                  <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4.7z" />
                </svg>
                <div style={{
                  background: '#3b82f6',
                  color: '#000',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '3px',
                  letterSpacing: '0.04em',
                }}>Alex</div>
              </div>
            </div>
          </div>

          {/* Floating Chat Card */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '-32px',
            width: '280px',
            background: 'rgba(18,18,18,0.97)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(20px)',
            zIndex: 10,
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(28,28,28,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: '#888',
            }}>
              <div style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: '#22c55e',
                animation: 'onlinePulse 2s infinite',
              }} />
              Team Chat · 2 active
            </div>
            <div style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: '#5a5a5a', lineHeight: 1.5 }}>
                <span style={{ color: '#e0e0e0', fontWeight: 500 }}>Alex:</span> I just updated the API endpoint.
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: '#5a5a5a', lineHeight: 1.5 }}>
                <span style={{ color: '#3b82f6', fontWeight: 500 }}>You:</span> Looks perfect, running build.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


export function InterviewerSection() {
  return (
    <section style={{
      width: '100%',
      minHeight: '90vh',
      padding: '96px 64px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: '#080808',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '7fr 5fr',
        gap: '80px',
        alignItems: 'center',
      }}>

        {/* Visual Content - Left */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: '#0c0c0c',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
            {/* Dashboard Top Bar */}
            <div style={{
              height: '52px',
              background: '#080808',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 28px',
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#4a4a4a',
              }}>Live Audit Dashboard</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: '#ef4444',
                  animation: 'onlinePulse 1.5s infinite',
                }}>REC</span>
                <style>{`@keyframes onlinePulse2 { 0%,100%{opacity:1} 50%{opacity:0.2} } @keyframes cursorPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              </div>
            </div>

            {/* Dashboard Grid */}
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

              {/* AI Status - full width */}
              <div style={{
                gridColumn: '1 / -1',
                border: '1px solid rgba(255,255,255,0.05)',
                background: '#101010',
                padding: '18px 24px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }}>AI Status</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#f0f0f0' }}>Analyzing behavior...</span>
              </div>

              {/* Clipboard */}
              <div style={{
                border: '1px solid rgba(255,255,255,0.05)',
                background: '#101010',
                padding: '18px 24px',
                borderRadius: '10px',
              }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a4a4a', marginBottom: '8px' }}>Clipboard</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#888' }}>Restricted</p>
              </div>

              {/* Plagiarism */}
              <div style={{
                border: '1px solid rgba(255,255,255,0.05)',
                background: '#101010',
                padding: '18px 24px',
                borderRadius: '10px',
              }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a4a4a', marginBottom: '8px' }}>Plagiarism</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#888' }}>Monitoring</p>
              </div>

              {/* Eye / Focus Tracker */}
              <div style={{
                gridColumn: '1 / -1',
                border: '1px solid rgba(255,255,255,0.05)',
                background: '#050505',
                borderRadius: '10px',
                padding: '40px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '28px',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  left: '24px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: '#4a4a4a',
                }}>Focus Tracker</span>

                {/* Animated Eye Tracking Component */}
                <div style={{ flexShrink: 0, marginTop: '16px', filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.2))' }}>
                  <EyeTracking 
                    variant="minimal"
                    eyeSize={104}
                    gap={26}
                   
                    showIrisDetail={true}
                    showEyelids={false} 
                  />
                </div>

                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: '#3a3a3a',
                  letterSpacing: '0.1em',
                }}>focus detected · on-screen</span>
              </div>

            </div>
          </div>
        </div>

        {/* Text Content - Right */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#4a4a4a',
            marginBottom: '20px',
          }}>
            02 / Assessment Mode
          </span>

          <h2 style={{
            fontSize: '52px',
            fontWeight: 300,
            color: '#f0f0f0',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
          }}>
            Intelligent reporting & strict anti-cheat.
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#6a6a6a',
            lineHeight: 1.75,
            marginBottom: '44px',
          }}>
            A locked-down space for technical recruiting. The candidate's editor is strictly
            monitored with AI-powered reporting assisting you every step of the way.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'AI Assessment Scoring',
              'Focus monitoring & prevention',
              'Clipboard restrictions',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12.5px',
                  color: '#b0b0b0',
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}