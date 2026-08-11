"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw, Home, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function LeftMeetingScreen({ roomId, onRejoin }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/dashboard");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-[#141518] text-white flex flex-col justify-between p-6 select-none"
    >
      {/* Top Bar: Countdown Timer & Upgrade */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-blue-400 flex items-center justify-center font-semibold text-xs text-blue-300">
            {countdown}
          </div>
          <span className="text-sm font-medium text-gray-300">
            Returning to home screen
          </span>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2 bg-[#c2e7ff]/10 hover:bg-[#c2e7ff]/20 text-[#c2e7ff] font-medium text-xs rounded-full transition-colors"
        >
          Dashboard
        </button>
      </div>

      {/* Center Main End Screen Content */}
      <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto my-auto py-8">
        <h1 className="text-3xl font-normal text-white mb-8 tracking-tight">
          You&apos;ve left the meeting
        </h1>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={onRejoin || (() => window.location.reload())}
            className="px-7 h-11 border border-white/20 hover:bg-white/10 text-blue-300 font-semibold text-sm rounded-full transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Rejoin
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-7 h-11 bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-sm rounded-full transition-all flex items-center gap-2 shadow-sm"
          >
            <Home className="w-4 h-4" /> Return to home screen
          </button>
        </div>

        <button
          onClick={() => alert("Thank you for your feedback!")}
          className="text-xs text-blue-400 hover:underline font-medium mb-12 flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Submit feedback
        </button>

        {/* Google Meet Safety Box Container */}
        <div className="w-full p-5 bg-[#1e1f24] border border-white/10 rounded-2xl flex items-start gap-4 text-left shadow-lg">
          <div className="h-10 w-10 rounded-2xl bg-blue-500/15 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-white mb-1">
              Your meeting is safe
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              No one can join a meeting unless invited or admitted by the host.
            </p>
            <button className="text-xs text-blue-400 hover:underline font-medium">
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-gray-500 py-2">
        DevMeet &bull; Google Material 3 Design System
      </div>
    </motion.div>
  );
}
