"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Video,
  FileText,
  PenTool,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function ToolConvergenceAnimation() {
  const [activeApp, setActiveApp] = useState(null);

  // App nodes with their positions and icons
  const apps = [
    {
      id: 'vscode',
      name: 'VS Code Live Share',
      sub: 'Code Sync',
      color: '#007ACC',
      x: 180,
      y: 110,
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M17.5 2.5L7.2 11.2L2.5 7.6L1 8.8L6.4 13.5L1 18.2L2.5 19.4L7.2 15.8L17.5 24.5L23 21.5V5.5L17.5 2.5Z" fill="#007ACC" />
          <path d="M17.5 7.2V19.8L10 13.5L17.5 7.2Z" fill="#0065A9" />
          <path d="M23 5.5L17.5 2.5V7.2L21.5 10.3L23 9V5.5Z" fill="#1F9CF0" />
          <path d="M23 21.5L17.5 24.5V19.8L21.5 16.7L23 18V21.5Z" fill="#1F9CF0" />
        </svg>
      )
    },
    {
      id: 'meet',
      name: 'Google Meet',
      sub: 'Video Calls',
      color: '#00AC47',
      x: 145,
      y: 195,
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <rect x="3" y="5" width="13" height="14" rx="2" fill="#00832d" />
          <path d="M16 9.5L21 6V18L16 14.5V9.5Z" fill="#00ac47" />
          <rect x="5" y="7" width="9" height="10" rx="1.5" fill="#26a69a" />
        </svg>
      )
    },
    {
      id: 'zoom',
      name: 'Zoom / Calls',
      sub: 'Screen Share',
      color: '#2D8CFF',
      x: 120,
      y: 285,
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <rect x="2" y="5" width="14" height="14" rx="3" fill="#2D8CFF" />
          <path d="M16 10L22 6.5V17.5L16 14V10Z" fill="#2D8CFF" />
          <circle cx="7.5" cy="12" r="2.5" fill="#ffffff" />
          <path d="M11 12H13.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'notes',
      name: 'Notepad / Scratchpad',
      sub: 'Chat & Notes',
      color: '#F59E0B',
      x: 135,
      y: 375,
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="2" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="8" y1="8" x2="16" y2="8" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="16" x2="13" y2="16" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M3 6H5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 10H5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'whiteboard',
      name: 'Miro / Excalidraw',
      sub: 'Architecture Canvas',
      color: '#6366F1',
      x: 175,
      y: 460,
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <rect x="3" y="4" width="18" height="13" rx="2" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
          <path d="M7 11C8.5 9 10.5 13 13 10C14.5 8 16 11 17 9.5" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="17" x2="12" y2="20" stroke="#6366F1" strokeWidth="1.5" />
          <line x1="8" y1="20" x2="16" y2="20" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'docs',
      name: 'Google Docs / Rubrics',
      sub: 'Scorecards',
      color: '#3B82F6',
      x: 235,
      y: 535,
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M6 3H14L19 8V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V4C5 3.45 5.45 3 6 3Z" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
          <path d="M14 3V8H19" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="15" x2="16" y2="15" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="18" x2="13" y2="18" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    }
  ];

  const targetPoint = { x: 670, y: 310 };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12 flex flex-col items-center select-none">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mb-4 sm:mb-8">
        <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Unified Engineering Stack
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
          One Workspace. Zero Friction.
        </h2>
        <p className="text-sm sm:text-base text-neutral-500 mt-2">
          Stop switching tabs between video calls, editors, whiteboards, and scratchpads. Everything converges into one live room.
        </p>
      </div>

      {/* Interactive Animation Stage */}
      <div className="w-full relative flex items-center justify-center overflow-visible">
        <svg
          viewBox="0 0 1100 620"
          className="w-full h-auto max-w-[1050px] overflow-visible"
          style={{ minHeight: '380px' }}
        >
          <defs>
            {/* Soft Blue Glow Filter */}
            <filter id="glow-beam" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="intense-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Beam Gradients */}
            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#2563eb" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0051d5" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="activeBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="laserBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="1" />
              <stop offset="20%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.1" />
            </linearGradient>

            {/* Core Center Shadow */}
            <radialGradient id="centerAura" cx="50%" cy="50%" r="50%">
              <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="75%" stopColor="#60a5fa" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Curved Fiber-Optic Beams from Each App to Center */}
          {apps.map((app, idx) => {
            const isHovered = activeApp === app.id;
            // Cubic bezier control points for elegant fluid converging curve
            const startX = app.x + 36;
            const startY = app.y;
            const endX = targetPoint.x;
            const endY = targetPoint.y;

            // Control points curving horizontally towards the center
            const cp1X = startX + (endX - startX) * 0.45;
            const cp1Y = startY;
            const cp2X = startX + (endX - startX) * 0.75;
            const cp2Y = endY;

            const pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

            return (
              <g key={app.id}>
                {/* Outer Glow Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHovered ? '#60a5fa' : '#93c5fd'}
                  strokeWidth={isHovered ? 6 : 3.5}
                  strokeOpacity={isHovered ? 0.7 : 0.25}
                  filter="url(#glow-beam)"
                  className="transition-all duration-300"
                />

                {/* Main Fiber Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHovered ? 'url(#activeBeamGrad)' : 'url(#beamGrad)'}
                  strokeWidth={isHovered ? 3.5 : 2}
                  strokeOpacity={isHovered ? 1 : 0.85}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Animated Flowing Pulses Along the Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 4.5 : 2.8}
                  strokeDasharray="14 180"
                  strokeLinecap="round"
                  filter="url(#glow-beam)"
                  style={{
                    animation: `streamFlow ${2.4 - idx * 0.15}s linear infinite`,
                  }}
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={isHovered ? 3.5 : 2}
                  strokeDasharray="24 220"
                  strokeLinecap="round"
                  style={{
                    animation: `streamFlow ${3 + idx * 0.2}s linear infinite reverse`,
                  }}
                />
              </g>
            );
          })}

          {/* 2. Unified Laser Stream Output on Right */}
          <g>
            {/* Outer Laser Glow Horizon */}
            <line
              x1={targetPoint.x}
              y1={targetPoint.y}
              x2={1100}
              y2={targetPoint.y}
              stroke="#60a5fa"
              strokeWidth="28"
              strokeOpacity="0.25"
              filter="url(#intense-glow)"
            />
            <line
              x1={targetPoint.x}
              y1={targetPoint.y}
              x2={1100}
              y2={targetPoint.y}
              stroke="#38bdf8"
              strokeWidth="12"
              strokeOpacity="0.5"
              filter="url(#glow-beam)"
            />

            {/* Core Focused Laser Beams */}
            <line
              x1={targetPoint.x}
              y1={targetPoint.y}
              x2={1100}
              y2={targetPoint.y}
              stroke="url(#laserBeamGrad)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1={targetPoint.x}
              y1={targetPoint.y - 4}
              x2={1100}
              y2={targetPoint.y - 4}
              stroke="url(#laserBeamGrad)"
              strokeWidth="2"
              strokeOpacity="0.7"
            />
            <line
              x1={targetPoint.x}
              y1={targetPoint.y + 4}
              x2={1100}
              y2={targetPoint.y + 4}
              stroke="url(#laserBeamGrad)"
              strokeWidth="2"
              strokeOpacity="0.7"
            />

            {/* Animated Laser Photon Streams */}
            <line
              x1={targetPoint.x}
              y1={targetPoint.y}
              x2={1100}
              y2={targetPoint.y}
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="40 140"
              strokeLinecap="round"
              filter="url(#glow-beam)"
              style={{
                animation: 'laserStream 1.2s linear infinite',
              }}
            />
            <line
              x1={targetPoint.x}
              y1={targetPoint.y}
              x2={1100}
              y2={targetPoint.y}
              stroke="#93c5fd"
              strokeWidth="2.5"
              strokeDasharray="25 180"
              strokeLinecap="round"
              style={{
                animation: 'laserStream 0.85s linear infinite',
              }}
            />
          </g>

          {/* 3. Central DevMeet Synthesis Star Node */}
          <g transform={`translate(${targetPoint.x}, ${targetPoint.y})`}>
            {/* Ambient Pulsing Aura */}
            <circle
              r="74"
              fill="url(#centerAura)"
              className="animate-pulse"
            />
            <circle
              r="62"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeDasharray="6 6"
              style={{ animation: 'spinClockwise 20s linear infinite' }}
            />

            {/* Glowing Backlight Disc */}
            <circle
              r="52"
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth="3"
              filter="url(#glow-beam)"
              style={{
                boxShadow: '0 0 40px rgba(37, 99, 235, 0.45)',
              }}
            />

            {/* Clean White Center Circle */}
            <circle
              r="50"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="1"
            />

            {/* Iconic DevMeet 4-Point Sparkle Icon */}
            <path
              d="M 0 -24 Q 0 0 -24 0 Q 0 0 0 24 Q 0 0 24 0 Q 0 0 0 -24 Z"
              fill="#090a0f"
            />

            {/* Horizontal Core Laser Exit Line */}
            <line
              x1="0"
              y1="0"
              x2="35"
              y2="0"
              stroke="#090a0f"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="2.5" fill="#38bdf8" />
          </g>

          {/* 4. The 6 App Squircle Cards on Left */}
          {apps.map((app) => {
            const isHovered = activeApp === app.id;
            return (
              <g
                key={app.id}
                transform={`translate(${app.x - 30}, ${app.y - 30})`}
                onMouseEnter={() => setActiveApp(app.id)}
                onMouseLeave={() => setActiveApp(null)}
                className="cursor-pointer transition-transform duration-200"
                style={{
                  transform: isHovered
                    ? `translate(${app.x - 32}px, ${app.y - 32}px) scale(1.08)`
                    : `translate(${app.x - 30}px, ${app.y - 30}px) scale(1)`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Glow on Hover */}
                {isHovered && (
                  <rect
                    x="-6"
                    y="-6"
                    width="72"
                    height="72"
                    rx="22"
                    fill="#3b82f6"
                    fillOpacity="0.25"
                    filter="url(#glow-beam)"
                  />
                )}

                {/* White Squircle Body */}
                <rect
                  x="0"
                  y="0"
                  width="60"
                  height="60"
                  rx="18"
                  fill="#ffffff"
                  stroke={isHovered ? '#2563eb' : '#e2e8f0'}
                  strokeWidth={isHovered ? 2 : 1}
                  filter="drop-shadow(0 8px 16px rgba(0, 0, 0, 0.08))"
                />

                {/* App Vector Icon */}
                <g transform="translate(18, 18)">
                  {app.icon}
                </g>

                {/* Right Laser Output Node */}
                <circle
                  cx="60"
                  cy="30"
                  r={isHovered ? 4.5 : 3.5}
                  fill="#ffffff"
                  stroke={isHovered ? '#2563eb' : '#38bdf8'}
                  strokeWidth="2"
                  filter="url(#glow-beam)"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes streamFlow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -194;
          }
        }

        @keyframes laserStream {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -180;
          }
        }

        @keyframes spinClockwise {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
