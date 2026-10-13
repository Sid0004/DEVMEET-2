"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LobbyDeviceDropdown({
  icon: Icon,
  devices = [],
  selectedDeviceId = "",
  onSelect,
  placeholder = "Select Device",
  type = "mic",
  audioLevel = 0,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const containerRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDevice = devices.find((d) => d.deviceId === selectedDeviceId) || devices[0];
  const labelText = selectedDevice?.label || placeholder;

  const playSpeakerTestSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      setIsPlayingTest(true);
      setTimeout(() => setIsPlayingTest(false), 500);
    } catch (err) {
      console.warn("Audio test error:", err);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Boxy Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-gray-200 text-xs rounded-none flex items-center justify-between gap-2 transition-colors cursor-pointer outline-none focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {Icon && <Icon className="w-4 h-4 text-neutral-500 dark:text-gray-400 flex-shrink-0" />}
          <span className="truncate font-medium text-neutral-900 dark:text-white">{labelText}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 dark:text-gray-400 flex-shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
          }`}
        />
      </button>

      {/* Boxy Theme-Adaptive Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.1 }}
            className="absolute bottom-11 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-none p-1 flex flex-col gap-1 min-w-[220px]"
          >
            {/* Header / Test Section per Device Type */}
            {type === "mic" && (
              <div className="px-3 py-2 bg-neutral-50 dark:bg-white/5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-600 dark:text-gray-400 uppercase tracking-wider">
                  <span>Microphone Status</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 lowercase font-mono">
                    {audioLevel > 5 ? "detecting sound..." : "mic test"}
                  </span>
                </div>
                {/* Dynamic Audio Level Meter Bar */}
                <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-center">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${Math.max(4, audioLevel)}%` }}
                  />
                </div>
              </div>
            )}

            {type === "speaker" && (
              <div className="px-3 py-2 bg-neutral-50 dark:bg-white/5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-neutral-600 dark:text-gray-400 uppercase tracking-wider">
                  Select Speakers
                </span>
                <button
                  type="button"
                  onClick={playSpeakerTestSound}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/30 border border-blue-300 dark:border-blue-400/40 rounded-none text-[10px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>{isPlayingTest ? "Testing..." : "Test Sound"}</span>
                </button>
              </div>
            )}

            {type === "video" && (
              <div className="px-3 py-2 text-[10px] font-bold text-neutral-600 dark:text-gray-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5">
                Select Camera
              </div>
            )}

            {/* Device List */}
            <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
              {devices.length > 0 ? (
                devices.map((device, idx) => {
                  const isSelected =
                    device.deviceId === selectedDeviceId ||
                    (!selectedDeviceId && idx === 0);
                  return (
                    <button
                      key={device.deviceId || idx}
                      type="button"
                      onClick={() => {
                        onSelect?.(device.deviceId);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs text-left flex items-start justify-between gap-2 transition-colors cursor-pointer rounded-none ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold border-l-2 border-blue-600 dark:border-blue-400"
                          : "hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-gray-200"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="truncate font-medium">
                          {device.label ||
                            `${
                              type === "mic"
                                ? "Microphone"
                                : type === "speaker"
                                ? "Speakers"
                                : "Camera"
                            } ${idx + 1}`}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] text-neutral-400 dark:text-gray-500 font-normal">
                            System default
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-xs text-neutral-400 dark:text-gray-500 text-center italic">
                  {type === "mic"
                    ? "Microphone (Default)"
                    : type === "speaker"
                    ? "Speakers (Default)"
                    : "Integrated Camera"}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
