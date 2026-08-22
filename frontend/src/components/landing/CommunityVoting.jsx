"use client";

import React, { useState } from 'react';
import { ThumbsUp, Check } from 'lucide-react';

export default function CommunityVoting() {
  const [votedSessions, setVotedSessions] = useState({});

  const candidateSessions = [
    {
      id: 'ai-agents',
      title: 'Building Deterministic Autonomous Multi-Agent Teams',
      speaker: 'Sarah Lin, Staff AI Systems Architect',
      votes: 1890
    },
    {
      id: 'rust-kernels',
      title: 'Writing Safe Linux Kernels & High-Speed Networking in Rust',
      speaker: 'Marcus Vance, Lead Systems Engineer',
      votes: 1450
    },
    {
      id: 'next-gen-oss',
      title: 'Zero-Latency Edge State: The Death of Centralized DBs?',
      speaker: 'Elena Rostova, Distributed Systems Lead',
      votes: 1620
    }
  ];

  const handleVote = (id) => {
    setVotedSessions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="community-voting" className="gridline-horizontal" style={{ padding: '80px 0', backgroundColor: 'var(--color-canvas-subtle)' }}>
      <div className="container">
        <div style={{ maxWidth: '800px', marginBottom: '40px' }}>
          <span className="section-tag">// community-driven lineup</span>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>
            vote-for-talks/
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--color-fg-muted)' }}>
            The DEVMEET community votes on which community lightning talks get selected for the mainstage spotlight. Vote for your favorites!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {candidateSessions.map((session) => {
            const isVoted = votedSessions[session.id];
            const currentVotes = session.votes + (isVoted ? 1 : 0);
            return (
              <div
                key={session.id}
                style={{
                  backgroundColor: 'var(--color-canvas-default)',
                  border: isVoted ? '1px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)',
                  borderRadius: '8px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isVoted ? '0 4px 16px rgba(8, 135, 43, 0.12)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-fg-muted)', marginBottom: '8px' }}>
                    {session.speaker}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-default)', fontSize: '18px', fontWeight: 700, lineHeight: 1.3, marginBottom: '16px' }}>
                    {session.title}
                  </h4>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--color-fg-default)' }}>
                    {currentVotes.toLocaleString()} votes
                  </span>

                  <button
                    onClick={() => handleVote(session.id)}
                    className={isVoted ? 'btn-primary-green' : 'btn-secondary'}
                    style={{ padding: '6px 14px', fontSize: '13px' }}
                  >
                    {isVoted ? (
                      <>
                        <Check size={14} />
                        <span>Voted</span>
                      </>
                    ) : (
                      <>
                        <ThumbsUp size={14} />
                        <span>Vote</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
