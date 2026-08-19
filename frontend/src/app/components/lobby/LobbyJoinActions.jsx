"use client";

import React, { useState } from "react";
import { ArrowRight, Code, Video as VideoIcon, Loader2, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LobbyJoinActions({
  verifiedRoom,
  isJoining,
  loaderText,
  onJoin,
  onReset,
}) {
  const [showOtherWays, setShowOtherWays] = useState(false);

  return (
    <div className="lg:col-span-5 flex flex-col justify-between h-full pt-1">
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Ready to join?</h3>
          <p className="text-xs text-gray-400 mt-1">
            {verifiedRoom.activeDevelopers || 1} developer(s) in workspace
          </p>
        </div>

        {/* Primary CTA Action & Google Meet "Other ways to join" Dropdown */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onJoin(false)}
            disabled={isJoining}
            className="w-full h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30 shadow-md"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{loaderText || "Joining Workspace..."}</span>
              </>
            ) : (
              <>
                <span>Join now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Google Meet Style "Other ways to join" Collapsible Button */}
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setShowOtherWays(!showOtherWays)}
              className="w-full h-12 px-6 bg-white/5 hover:bg-white/10 text-gray-200 font-semibold text-sm rounded-full border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer outline-none focus:outline-none"
            >
              <span>Other ways to join</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  showOtherWays ? "rotate-180 text-blue-400" : ""
                }`}
              />
            </button>

            {/* Collapsible Options Menu */}
            <AnimatePresence>
              {showOtherWays && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="mt-2 w-full bg-[#121316] border border-white/15 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl z-20"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtherWays(false);
                      onJoin(true);
                    }}
                    className="w-full h-11 px-3.5 rounded-xl text-xs text-left text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer border-none outline-none"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <Code className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Use Companion Mode (Code & Chat Only)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOtherWays(false);
                      onJoin(false);
                    }}
                    className="w-full h-11 px-3.5 rounded-xl text-xs text-left text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer border-none outline-none"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <VideoIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Present screen when entering</span>
                  </button>

                  <div className="h-px bg-white/10 my-0.5" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowOtherWays(false);
                      onReset();
                    }}
                    className="w-full h-11 px-3.5 rounded-xl text-xs text-left text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2.5 cursor-pointer border-none outline-none"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>Enter a different code or link</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
