"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, Code2, AlertTriangle, Scale, Ban, ShieldCheck, Mail } from 'lucide-react';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export default function TermsOfServicePage() {
  const lastUpdated = "August 22, 2026";

  const sections = [
    {
      id: "agreement",
      icon: FileText,
      title: "1. Acceptance of Terms",
      content: `By creating an account, accessing, or using DEVMEET ("the Platform", "we", "our", or "us"), you agree to be bound by these Terms of Service. If you do not agree with these Terms, you may not use DEVMEET. If you are entering into this agreement on behalf of a company or organization, you represent that you have the authority to bind that entity.`
    },
    {
      id: "accounts",
      icon: CheckCircle2,
      title: "2. Eligibility & Account Security",
      content: `To use DEVMEET, you must be at least 16 years of age or the age of legal majority in your jurisdiction. You are responsible for safeguarding your login credentials (passwords, OAuth tokens) and for all activity that occurs under your account. You must immediately notify DEVMEET of any unauthorized access.`
    },
    {
      id: "acceptable-use",
      icon: Ban,
      title: "3. Acceptable Use & Sandboxed Execution",
      content: `DEVMEET provides interactive developer environments and terminal execution sandboxes. You agree NOT to:`,
      bullets: [
        "Execute malicious scripts, malware, trojans, ransomware, or cryptocurrency mining programs inside our execution microVMs.",
        "Attempt to escape, breach, or compromise sandbox isolation boundaries or host infrastructure.",
        "Engage in denial-of-service attacks, port scanning, or unauthorized probing of other systems via our networks.",
        "Interfere with or disrupt the operation of peer-to-peer WebRTC video, audio, or WebSocket signaling channels.",
        "Harass, impersonate, or infringe upon the intellectual property or privacy rights of any other user."
      ]
    },
    {
      id: "intellectual-property",
      icon: Code2,
      title: "4. Intellectual Property & Code Ownership",
      content: `You retain all ownership, copyright, and intellectual property rights in the source code, algorithms, notes, and architectural diagrams you create or input into DEVMEET. We do not claim ownership of user-generated code. You grant DEVMEET only the limited, non-exclusive license necessary to transmit, compile, format, and execute your code to provide the real-time collaboration features of the platform.`
    },
    {
      id: "assessments",
      icon: ShieldCheck,
      title: "5. Technical Interviews & Assessment Proctoring",
      content: `When participating in an interview or assessment session:`,
      bullets: [
        "Candidates agree to provide authentic, individual responses without unauthorized external generative assistance where prohibited by the hiring organization.",
        "Assessment telemetry (e.g. tab switches, editor activity) may be analyzed and presented to the organization conducting the interview.",
        "Both interviewers and candidates consent to peer-to-peer transmission of audio and video required for the live session."
      ]
    },
    {
      id: "disclaimers",
      icon: AlertTriangle,
      title: "6. Warranty Disclaimers & Service Availability",
      content: `DEVMEET IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. While we strive for 99.9% uptime, we do not warrant that the service will be uninterrupted, error-free, or that microVM compiler execution will always be latency-free.`
    },
    {
      id: "liability",
      icon: Scale,
      title: "7. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEVMEET AND ITS OFFICERS, DIRECTORS, AND EMPLOYEES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION ARISING FROM YOUR USE OF THE PLATFORM.`
    },
    {
      id: "contact",
      icon: Mail,
      title: "8. Questions & Contact Information",
      content: `For legal notices or questions regarding these Terms of Service, please reach out to legal@devmeet.io or contact our team at support@devmeet.io.`
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
              href="/privacy"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors px-2 py-1"
            >
              Privacy Policy
            </Link>
            <AnimatedThemeToggler />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        {/* Title & Metadata Banner */}
        <div className="mb-12 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-400 mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>LEGAL AGREEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight mb-3">
            Terms of Service
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
                  <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-purple-600 dark:text-purple-400">
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
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
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
