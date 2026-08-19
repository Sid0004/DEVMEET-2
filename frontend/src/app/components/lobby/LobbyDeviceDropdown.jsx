"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Volume2, Play } from "lucide-react";
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
      {/* Trigger Button Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3.5 bg-[#121316] hover:bg-[#1a1b20] border border-white/10 hover:border-white/20 rounded-xl text-gray-200 text-xs flex items-center justify-between gap-2 transition-all cursor-pointer outline-none focus:outline-none"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {Icon && <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          <span className="truncate font-medium">{labelText}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-400" : ""
          }`}
        />
      </button>

      {/* Custom Dark Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-12 left-0 right-0 z-50 bg-[#1e1f24] border border-white/15 rounded-2xl shadow-2xl overflow-hidden p-1.5 flex flex-col gap-1 min-w-[220px]"
          >
            {/* Header / Test Section per Device Type */}
            {type === "mic" && (
              <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex flex-col gap-1.5 rounded-t-xl">
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <span>Select Microphone</span>
                  <span className="text-[10px] text-emerald-400 lowercase font-mono">
                    {audioLevel > 5 ? "detecting sound..." : "mic test"}
                  </span>
                </div>
                {/* Dynamic Audio Level Meter Bar */}
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex items-center">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 transition-all duration-75 rounded-full"
                    style={{ width: `${Math.max(4, audioLevel)}%` }}
                  />
                </div>
              </div>
            )}

            {type === "speaker" && (
              <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between gap-2 rounded-t-xl">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Select Speakers
                </span>
                <button
                  type="button"
                  onClick={playSpeakerTestSound}
                  className="px-2.5 py-1 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 rounded-lg text-[10px] font-semibold text-blue-300 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-3 h-3 text-blue-400" />
                  <span>{isPlayingTest ? "Testing..." : "Test Sound"}</span>
                </button>
              </div>
            )}

            {type === "video" && (
              <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10">
                Select Camera
              </div>
            )}

            {/* Device List */}
            <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
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
                      className={`w-full px-3 py-2.5 rounded-xl text-xs text-left flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-600/15 text-blue-300 font-semibold"
                          : "hover:bg-white/5 text-gray-300"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="truncate">
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
                          <span className="text-[10px] text-gray-500 font-normal">
                            System default
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-xs text-gray-400 text-center italic">
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
