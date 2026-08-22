"use client";

import React from 'react';
import FeaturesWhy from './FeaturesWhy';

export default function Pillars() {
  return (
    <div id="river">
      {/* 1. THE PROBLEM: The Broken Status Quo */}
      <section style={{ padding: '80px 0 40px', backgroundColor: 'var(--color-canvas-default)', borderBottom: 'none' }}>
        <div className="container">
          <div style={{ maxWidth: '920px', marginBottom: '40px' }}>
            <h2 className="section-title" style={{ marginBottom: '14px', marginTop: '12px' }}>
              Why are we still{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span>juggling different tools</span>
                <svg
                  viewBox="0 0 280 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  style={{
                    position: 'absolute',
                    left: '-1%',
                    bottom: '-6px',
                    width: '102%',
                    height: '12px',
                    overflow: 'visible',
                    pointerEvents: 'none'
                  }}
                >
                  <path
                    d="M3 8.5C65 2.5 160 2 277 5.5C215 10.5 85 12 18 10"
                    stroke="#d1242f"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>{' '}
              for one session?
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--color-fg-muted)', lineHeight: 1.6 }}>
              Today's remote development and technical hiring are broken by disconnected apps, manual evaluation fatigue, and cheating guesswork.
            </p>
          </div>

          {/* 3 Problem Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1px',
              backgroundColor: 'var(--color-border-default)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            {/* Problem 1: Tool Overload */}
            <div
              className="problem-card"
              style={{
                backgroundColor: 'var(--color-canvas-default)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#d1242f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Tool Fatigue
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-default)', fontSize: '19px', fontWeight: 700, color: 'var(--color-fg-default)', marginBottom: '10px' }}>
                  Juggling 4 Separate Apps
                </h3>
                <p style={{ fontFamily: 'var(--font-default)', fontSize: '14px', color: 'var(--color-fg-muted)', lineHeight: 1.6, margin: 0 }}>
                  Google Meet/Zoom for video, VS Code Live Share for editing, Slack for chat, and Docker for runtime. Constant "can you see my screen?", laggy screen shares, and permission nightmares.
                </p>
              </div>
            </div>

            {/* Problem 2: Manual Interview Strain */}
            <div
              className="problem-card"
              style={{
                backgroundColor: 'var(--color-canvas-default)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#d1242f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Interviewer Strain
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-default)', fontSize: '19px', fontWeight: 700, color: 'var(--color-fg-default)', marginBottom: '10px' }}>
                  Manual Prompts &amp; ChatGPT Tabs
                </h3>
                <p style={{ fontFamily: 'var(--font-default)', fontSize: '14px', color: 'var(--color-fg-muted)', lineHeight: 1.6, margin: 0 }}>
                  Interviewers forced to open ChatGPT in secret tabs to come up with follow-up hints, calculate Big-O complexity on scrap paper, and spend hours writing post-interview rubrics by hand.
                </p>
              </div>
            </div>

            {/* Problem 3: Anti-Cheat Paranoia */}
            <div
              className="problem-card"
              style={{
                backgroundColor: 'var(--color-canvas-default)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#d1242f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Cheating Guesswork
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-default)', fontSize: '19px', fontWeight: 700, color: 'var(--color-fg-default)', marginBottom: '10px' }}>
                  Off-Screen Phones &amp; Task Manager
                </h3>
                <p style={{ fontFamily: 'var(--font-default)', fontSize: '14px', color: 'var(--color-fg-muted)', lineHeight: 1.6, margin: 0 }}>
                  Constant second-guessing: Is the candidate looking off-screen at ChatGPT on their phone? Are they hiding AI extensions? Or pasting code blocks they didn’t actually write?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE SOLUTION: OriginKit Features-04 Section */}
      <FeaturesWhy />

      <style>{`
        .problem-card:hover {
          background-color: #fff0f2 !important;
        }
      `}</style>
    </div>
  );
}
