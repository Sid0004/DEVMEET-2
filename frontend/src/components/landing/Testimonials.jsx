"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Sparkles } from 'lucide-react';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      quote: "Before DEVMEET, I used to juggle Google Meet, CodeSandbox, and open ChatGPT on my second screen to verify if the candidate's solution was optimal. Now the AI companion shows Big-O complexity live and flags off-screen tab switches instantly.",
      author: "Sarah Lin",
      handle: "@sarah_codes",
      company: "Founding Engineer @ VectorScale",
      role: "Technical Hiring",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    {
      quote: "Screen sharing over Slack or Zoom always has that annoying 200ms lag where you can't type or see where your teammate is clicking. DEVMEET's CRDT multiplayer editor feels like Google Docs for code — instant sub-millisecond sync across Tokyo and SF.",
      author: "David Chen",
      handle: "@dchen_sys",
      company: "Staff Systems Engineer @ CloudNode",
      role: "Pair Programming",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    {
      quote: "We run weekly open-source mob programming sessions. Being able to launch an instant room with a cloud terminal, 40+ language runtimes, and crystal-clear video in 2 seconds without sending calendar links is an absolute superpower.",
      author: "Marcus Vance",
      handle: "@marcv_dev",
      company: "Core Maintainer @ AsyncRust OSS",
      role: "Mob Programming",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    {
      quote: "The post-interview rubric export saved our hiring committee hours. It auto-generates code playback timelines, complexity benchmarks, and integrity logs so we don't have to debate what happened in the interview.",
      author: "Priya Patel",
      handle: "@priyacodes",
      company: "Engineering Director @ FinScale",
      role: "Hiring Rubrics",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    }
  ];

  // Auto-cycle every 3.5 seconds, pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section id="testimonials" className="gridline-horizontal" style={{ padding: '80px 0', backgroundColor: 'var(--color-canvas-subtle)' }}>
      <div className="container">
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          {/* Header & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              
             
               
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Indicator Dots */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    style={{
                      width: idx === currentIndex ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: idx === currentIndex ? 'var(--color-accent-primary)' : 'var(--color-border-default)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={prevTestimonial}
                  aria-label="Previous Testimonial"
                  className="btn-secondary"
                  style={{ padding: '8px', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextTestimonial}
                  aria-label="Next Testimonial"
                  className="btn-secondary"
                  style={{ padding: '8px', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Testimonial Card */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              backgroundColor: 'var(--color-canvas-default)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '12px',
              padding: '40px 36px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              transition: 'border-color 0.2s ease',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <Quote size={32} color="var(--color-accent-primary)" style={{ opacity: 0.35, marginBottom: '14px' }} />
              <blockquote
                style={{
                  fontFamily: 'var(--font-default)',
                  fontSize: 'clamp(17px, 2.4vw, 22px)',
                  fontWeight: 600,
                  lineHeight: 1.45,
                  letterSpacing: '-0.02em',
                  marginBottom: '28px',
                  color: 'var(--color-fg-default)'
                }}
              >
                &ldquo;{current.quote}&rdquo;
              </blockquote>
            </div>

            {/* Author Footer */}
            <div
              style={{
                borderTop: '1px solid var(--color-border-subtle)',
                paddingTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={current.avatar}
                  alt={current.author}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-default)', fontWeight: 700, fontSize: '15px', color: 'var(--color-fg-default)' }}>
                      {current.author}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-fg-muted)' }}>
                      {current.handle}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-fg-muted)', marginTop: '2px' }}>
                    {current.company}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  backgroundColor: 'rgba(24, 119, 242, 0.08)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(24, 119, 242, 0.2)',
                  color: 'var(--color-accent-primary)',
                  fontWeight: 600
                }}
              >
                {current.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
