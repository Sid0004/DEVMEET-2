"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Video,
  Terminal,
  Layers,
  Check
} from 'lucide-react';
import FlowingMenu from '@/components/originkit/FlowingMenu';

export default function Agenda() {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const flowingItems = [
    {
      id: 'editor',
      link: '/login',
      text: 'Multiplayer Monaco Editor',
      icon: Code2,
      tag: 'COLLABORATION',
      title: 'Multiplayer Monaco Code Editor',
      desc: 'Real-time collaborative pair programming with shared cursors, VS Code keybindings, and sub-millisecond CRDT synchronization.',
      highlights: [
        'Live color-coded teammate cursors with presence tags',
        'Native VS Code shortcuts & multi-tab file tree',
        'Zero-latency conflict-free editing for large teams'
      ]
    },
    {
      id: 'video',
      link: '/login',
      text: 'Integrated WebRTC Video & Audio',
      icon: Video,
      tag: 'COMMUNICATION',
      title: 'Native Video & Voice Calling',
      desc: 'Crystal-clear peer-to-peer HD video, active speaker detection, and in-room markdown chat built directly into the workspace.',
      highlights: [
        'Low-latency P2P video & spatial audio calling',
        'In-room markdown messaging with code snippets',
        '1-click display and window screen sharing'
      ]
    },
    {
      id: 'runner',
      link: '/login',
      text: 'Isolated Sandbox Terminal',
      icon: Terminal,
      tag: 'EXECUTION',
      title: 'Isolated Code Runner & Terminal',
      desc: 'Compile and run code instantly in isolated containers across 40+ programming languages with live terminal streaming.',
      highlights: [
        '40+ pre-installed runtimes (Node, Python, Go, Rust, C++)',
        'Interactive stdin / stdout terminal execution',
        'Real execution timers and memory telemetry'
      ]
    },
    {
      id: 'whiteboard',
      link: '/login',
      text: 'Architecture Whiteboard',
      icon: Layers,
      tag: 'ARCHITECTURE',
      title: 'Multiplayer System Whiteboard',
      desc: 'Infinite collaborative vector canvas for sketching distributed systems, database schemas, and microservice flows together.',
      highlights: [
        'Real-time multi-pointer drawing & smart connectors',
        'Pre-built cloud and system architecture stencils',
        'Instant high-resolution SVG and PNG export'
      ]
    },
  ];

  const [cardOffset, setCardOffset] = useState({ left: 24, top: 16 });

  const handleItemHover = (idx, ev) => {
    setHoveredIdx(idx);
    if (ev && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const cardWidth = 320;
      const isRightSide = x + cardWidth + 40 > rect.width;
      const left = isRightSide ? x - cardWidth - 20 : x + 24;
      const top = Math.max(16, Math.min(y - 60, 520 - 240));
      setCardOffset({ left, top });
      setMousePos({ x, y });
    }
  };

  const activeItem = hoveredIdx !== null ? flowingItems[hoveredIdx] : null;

  const cardLeft = cardOffset.left;
  const cardTop = cardOffset.top;

  return (
    <section
      id="use-cases"
      className="relative bg-white text-neutral-900 overflow-hidden"
      style={{
        padding: '72px 0 0',
        backgroundColor: '#ffffff',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 mb-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              Everything You Need in One Room
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 mt-2 max-w-2xl">
              Hover over any workspace mode to experience the interactive flowing animation.
            </p>
          </div>
        </div>
      </div>

      {/* FlowingMenu Container with Cursor-Following Popup Card */}
      <div
        ref={containerRef}
        className="w-full relative border-t border-b border-neutral-200"
        style={{ height: '520px', backgroundColor: '#ffffff' }}
      >
        <FlowingMenu
          items={flowingItems}
          speed={14}
          textColor="#111827"
          bgColor="#ffffff"
          marqueeBgColor="#0051d5"
          marqueeTextColor="#ffffff"
          borderColor="rgba(0, 0, 0, 0.1)"
          onItemHover={handleItemHover}
        />

        {/* Minimalist White Hover Popup Card following cursor */}
        <AnimatePresence>
          {activeItem && hoveredIdx !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{
                opacity: 1,
                scale: 1,
                left: cardLeft,
                top: cardTop,
              }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{
                left: { type: 'spring', damping: 28, stiffness: 320, mass: 0.4 },
                top: { type: 'spring', damping: 28, stiffness: 320, mass: 0.4 },
                opacity: { duration: 0.14 },
                scale: { duration: 0.14 },
              }}
              className="absolute z-40 w-[300px] sm:w-[320px] bg-white border border-neutral-200 rounded-xl p-5 shadow-2xl text-neutral-900 pointer-events-none"
              style={{
                boxShadow: '0 16px 40px rgba(0, 81, 213, 0.12), 0 4px 14px rgba(0, 0, 0, 0.06)',
              }}
            >
              {/* Category Tag */}
              <span className="font-mono text-[10.5px] font-bold text-blue-600 uppercase tracking-wider block mb-1.5">
                {activeItem.tag}
              </span>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-1.5 leading-snug">
                {activeItem.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                {activeItem.desc}
              </p>

              {/* Clean Checklist */}
              <ul className="space-y-2 pt-3 border-t border-neutral-100">
                {activeItem.highlights.map((hl, i) => (
                  <li key={i} className="text-xs text-neutral-700 flex items-start gap-2 leading-tight">
                    <Check
                      size={13}
                      className="text-blue-600 shrink-0 mt-0.5 stroke-[2.5]"
                    />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
