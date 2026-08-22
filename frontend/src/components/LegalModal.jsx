"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Scale, Eye, Server, Lock, UserCheck, RefreshCw, FileText, Ban, Code2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-[#171717]/50">
            {/* Tab Pill Toggle */}
            <div className="inline-flex p-1 bg-neutral-200/70 dark:bg-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'privacy'
                    ? 'bg-white dark:bg-[#202020] text-neutral-900 dark:text-white shadow-sm font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Privacy Policy</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'terms'
                    ? 'bg-white dark:bg-[#202020] text-neutral-900 dark:text-white shadow-sm font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Terms of Service</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close legal modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {activeTab === 'privacy' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    1. Overview & Data Collection
                  </h3>
                  <p>
                    DEVMEET collects only the information required to power real-time developer collaboration, secure sandbox microVM compilation, WebRTC audio/video calling, and AI proctoring integrity evaluations. We never sell or monetize your personal data.
                  </p>
                  <ul className="mt-2.5 space-y-1.5 pl-4 list-disc text-xs sm:text-sm">
                    <li><strong>Account Data:</strong> Name, email address, OAuth profile info from GitHub/Google.</li>
                    <li><strong>Session Media:</strong> Real-time WebRTC audio and video streams (ephemeral unless explicitly recorded).</li>
                    <li><strong>Code & Terminals:</strong> Code edits, execution outputs, and shared room files.</li>
                    <li><strong>Proctoring Telemetry:</strong> On-device local computer vision evaluation for assessment rooms.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    2. Data Usage & Security
                  </h3>
                  <p>
                    Data is used exclusively to facilitate multiplayer synchronization, generate hiring scorecards, and protect infrastructure. All traffic is encrypted in transit via TLS 1.3 and media is secured through DTLS-SRTP.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    3. Your Rights & Erasure
                  </h3>
                  <p>
                    You have full rights under GDPR and CCPA to export, rectify, or delete your account and associated session telemetry at any time via Account Settings or by contacting <span className="font-mono text-blue-600 dark:text-blue-400">privacy@devmeet.io</span>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    1. Code Ownership & IP
                  </h3>
                  <p>
                    You retain 100% ownership, copyright, and intellectual property rights in all source code, architecture designs, and algorithms written or compiled inside DEVMEET. We claim no ownership over user-generated code.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <Ban className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    2. Acceptable Sandbox Use
                  </h3>
                  <p>
                    Execution environments may not be used for malware creation, crypto mining, network attacks, or attempting microVM breakout. Violations result in immediate account termination.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    3. Technical Assessment Integrity
                  </h3>
                  <p>
                    Interview candidates agree to authentic individual participation. Telemetry regarding editor focus and compiler runs is provided to the hiring organization overseeing the room.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    4. Limitation of Liability
                  </h3>
                  <p>
                    DEVMEET is provided &quot;as is&quot;. We strive for 99.9% uptime but are not liable for incidental or consequential damages resulting from network interruptions.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#171717]/50 flex items-center justify-between">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Last updated: August 2026
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
