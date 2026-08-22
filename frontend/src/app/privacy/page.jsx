"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Server, UserCheck, RefreshCw, Mail } from 'lucide-react';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 22, 2026";

  const sections = [
    {
      id: "overview",
      icon: Shield,
      title: "1. Overview & Scope",
      content: `DEVMEET ("we", "our", or "us") provides a real-time collaborative engineering workspace and technical assessment platform. This Privacy Policy describes how we collect, use, process, and disclose your personal information when you use our web applications, developer sandboxes, WebRTC video calling, and related services.`
    },
    {
      id: "data-collection",
      icon: Eye,
      title: "2. Information We Collect",
      content: `We collect information necessary to provide low-latency developer collaboration and secure hiring environments:`,
      bullets: [
        "Account & Identity Data: Name, email address, username, profile avatar, and authentication identifiers from GitHub or Google OAuth.",
        "Collaboration & Workspace Data: Code edits, programming language settings, terminal inputs/outputs, room IDs, whiteboard drawings, and assessment notes.",
        "Audio & Video Streams: Real-time peer-to-peer WebRTC video and voice media transmitted during live pair programming or interview rooms.",
        "AI Proctoring Telemetry: In proctored assessment rooms, local on-device computer vision models evaluate focus indicators (e.g., eye gaze, tab switching, multiple persons detected). Raw biometric identifiers are processed client-side and never sold.",
        "Technical & Telemetry Data: IP address, browser type, device information, connection latency, and crash diagnostics."
      ]
    },
    {
      id: "data-usage",
      icon: Server,
      title: "3. How We Use Your Information",
      content: `We use your information strictly for legitimate product operation and security purposes:`,
      bullets: [
        "To synchronize multiplayer code editors and establish peer-to-peer WebRTC media connections.",
        "To authenticate users, safeguard accounts, and enforce room permission controls.",
        "To generate automated candidate evaluation metrics and proctoring integrity summaries for hiring organizations.",
        "To prevent abuse, resource exhaustion, or unauthorized sandbox code execution.",
        "To continuously optimize room latency, compiler speed, and platform reliability."
      ]
    },
    {
      id: "data-sharing",
      icon: Lock,
      title: "4. Information Sharing & Sub-processors",
      content: `We do not sell, rent, or trade your personal data. We disclose information only under specific circumstances:`,
      bullets: [
        "Room Participants: Other invited engineers or interviewers inside your active room will see your shared code, video/audio stream, and display name.",
        "Hiring Organizations: If you complete a technical interview, your code solutions and assessment scorecard are shared with the prospective employer who invited you.",
        "Trusted Infrastructure Providers: Cloud hosting, database hosting, and OAuth providers (Google, GitHub) bound by strict data protection agreements.",
        "Legal Compliance: When required by applicable law, court order, or governmental regulation."
      ]
    },
    {
      id: "security",
      icon: UserCheck,
      title: "5. Data Security & Retention",
      content: `We implement enterprise-grade security standards including TLS 1.3 encryption in transit, DTLS-SRTP for WebRTC media streams, secure HTTP-only cookies, and encrypted cloud databases. Session media streams are ephemeral and not retained unless an interviewer explicitly records a room with participant consent.`
    },
    {
      id: "user-rights",
      icon: RefreshCw,
      title: "6. Your Rights (GDPR & CCPA)",
      content: `Regardless of your location, you have rights over your data:`,
      bullets: [
        "Right of Access & Portability: Request an export of your account data and room history.",
        "Right to Rectification: Correct inaccurate or outdated profile information in Account Settings.",
        "Right to Erasure ('Right to be Forgotten'): Delete your account and associated session history at any time.",
        "Opt-out of Communications: Manage notification preferences directly from your account."
      ]
    },
    {
      id: "contact",
      icon: Mail,
      title: "7. Contact & Data Inquiries",
      content: `If you have questions, feedback, or requests regarding this Privacy Policy, please contact our Data Protection Officer at privacy@devmeet.io or security@devmeet.io.`
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0c0c] text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-[#0c0c0c]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to DevMeet</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/terms"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors px-2 py-1"
            >
              Terms of Service
            </Link>
            <AnimatedThemeToggler />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        {/* Title & Metadata Banner */}
        <div className="mb-12 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>LEGAL & COMPLIANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Last updated: <span className="font-mono text-neutral-800 dark:text-neutral-200">{lastUpdated}</span>
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-10">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section key={sec.id} id={sec.id} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-blue-600 dark:text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-medium tracking-tight text-neutral-900 dark:text-white">
                    {sec.title}
                  </h2>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {sec.content}
                </p>
                {sec.bullets && (
                  <ul className="mt-3 space-y-2 pl-4 list-disc text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
                    {sec.bullets.map((b, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div>
            © {new Date().getFullYear()} DEVMEET Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:underline">
              Sign In
            </Link>
            <Link href="/#hero" className="hover:underline">
              Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
