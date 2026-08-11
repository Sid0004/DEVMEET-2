"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Keyboard,
  Check,
  Video as VideoIcon,
  VideoOff,
  Mic,
  MicOff,
  ArrowRight,
  Loader2,
  Code,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";
import { useAppSelector } from "@/redux/hooks";

export default function InlineCodeJoinBar({ onExpandChange }) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const userName = user?.name ? user.name.toUpperCase() : user?.email ? user.email.split("@")[0].toUpperCase() : "DEVELOPER";
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [joinCode, setJoinCode] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Real-time backend verification states
  const [isVerifyingRoom, setIsVerifyingRoom] = useState(false);
  const [verifiedRoom, setVerifiedRoom] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  // Pre-join lobby media states
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [mediaError, setMediaError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [loaderText, setLoaderText] = useState("");
  const [showOtherWaysMenu, setShowOtherWaysMenu] = useState(false);

  const handleClose = () => {
    setIsFocused(false);
    setVerifiedRoom(null);
    setVerifyError(null);
    setJoinCode("");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(!!verifiedRoom);
    }
  }, [verifiedRoom, onExpandChange]);

  // Outside Click Listener to smoothly collapse when user clicks anywhere else
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (isFocused || verifiedRoom) &&
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isFocused, verifiedRoom]);

  // URL / Code Smart Extractor
  const parseRoomCode = (input) => {
    if (!input) return "";
    const trimmed = input.trim();
    const urlMatch = trimmed.match(/[?&]room=([a-zA-Z0-9]{4,8})/);
    if (urlMatch) return urlMatch[1];
    const codeMatch = trimmed.match(/\b([a-zA-Z0-9]{6})\b/);
    if (codeMatch) return codeMatch[1];
    return trimmed;
  };

  const parsedTargetRoomId = parseRoomCode(joinCode);
  const isCodeFormatValid = parsedTargetRoomId.length >= 6;

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Real-Time Backend API Room Verification
  useEffect(() => {
    if (!parsedTargetRoomId || parsedTargetRoomId.length < 6) {
      setVerifiedRoom(null);
      setVerifyError(null);
      setIsVerifyingRoom(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsVerifyingRoom(true);
      setVerifyError(null);
      try {
        const response = await apiRequest(`/api/v1/rooms/${parsedTargetRoomId}`, {
          method: "GET",
        });
        if (response.data) {
          setVerifiedRoom(response.data);
        } else {
          setVerifyError(`Room #${parsedTargetRoomId} does not exist or has ended.`);
          setVerifiedRoom(null);
        }
      } catch (err) {
        setVerifyError(
          err.response?.data?.message || `Room #${parsedTargetRoomId} does not exist or has ended.`
        );
        setVerifiedRoom(null);
      } finally {
        setIsVerifyingRoom(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [parsedTargetRoomId]);

  // Media setup when room is VERIFIED by server and spotlight is active
  useEffect(() => {
    if (verifiedRoom && isFocused) {
      const setupMedia = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        } catch (err) {
          console.warn("Media setup warning:", err);
          setMediaError("Camera/Mic not detected. Joining in text/editor mode.");
        }
      };
      setupMedia();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [verifiedRoom, isFocused]);

  // Toggle Camera
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !cameraEnabled;
        setCameraEnabled(!cameraEnabled);
      }
    } else {
      setCameraEnabled(!cameraEnabled);
    }
  };

  // Toggle Mic
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !micEnabled;
        setMicEnabled(!micEnabled);
      }
    } else {
      setMicEnabled(!micEnabled);
    }
  };

  const handleJoinSession = async (noVC = false) => {
    if (!verifiedRoom) return;
    const roomId = verifiedRoom.roomId || parsedTargetRoomId;
    setIsJoining(true);
    setLoaderText(`Joining workspace "${verifiedRoom.roomName || roomId}"...`);

    if (noVC) {
      sessionStorage.setItem(`devmeet_mic_pref_${roomId}`, "false");
      sessionStorage.setItem(`devmeet_cam_pref_${roomId}`, "false");
      sessionStorage.setItem(`devmeet_no_vc_${roomId}`, "true");
    } else {
      sessionStorage.setItem(`devmeet_mic_pref_${roomId}`, micEnabled ? "true" : "false");
      sessionStorage.setItem(`devmeet_cam_pref_${roomId}`, cameraEnabled ? "true" : "false");
      sessionStorage.removeItem(`devmeet_no_vc_${roomId}`);
    }

    try {
      await apiRequest(`/api/v1/rooms/${roomId}/join`, { method: "POST" });
    } catch (e) {
      console.warn("Join endpoint notification:", e);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setTimeout(() => {
      router.push(`/workspace?room=${roomId}`);
    }, 400);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div
        ref={containerRef}
        animate={{
          borderRadius: verifiedRoom ? 24 : 9999,
        }}
        transition={{
          duration: 0.28,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`w-full bg-[#1e1f24] border text-white overflow-hidden shadow-2xl transition-all duration-300 ${
          !verifiedRoom
            ? "max-w-md border-white/10 hover:border-white/20 shadow-md"
            : "max-w-5xl border-white/15"
        }`}
      >
        <AnimatePresence mode="wait">
          {!verifiedRoom ? (
            <motion.div
              key="search-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col w-full"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="flex items-center gap-3 px-4 h-12 w-full"
              >
                <Keyboard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={joinCode}
                  onFocus={() => setIsFocused(true)}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter a code or link"
                  className="bg-transparent text-[15px] text-white placeholder-gray-400 focus:outline-none flex-1 font-normal"
                />
                {isVerifyingRoom ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#36373b] hover:bg-white/20 text-gray-300 hover:text-white rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>Join</span>
                  </button>
                )}
              </form>
              {verifyError && (
                <div className="px-4 py-1.5 bg-red-500/10 text-red-400 text-xs font-medium text-center border-t border-red-500/20">
                  {verifyError}
                </div>
              )}
            </motion.div>
          ) : (
            /* Google Meet Full-Page Pre-Join Lobby View */
            <motion.div
              key="verified-lobby"
              initial={{ opacity: 0, scale: 0.98, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 sm:p-8 flex flex-col gap-6"
            >
              {/* Top Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      {verifiedRoom.roomName || `Room #${verifiedRoom.roomId}`}
                      <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Room Verified
                      </span>
                    </h4>
                    <p className="text-xs text-gray-400">
                      Code: <span className="font-mono text-gray-300">#{verifiedRoom.roomId}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Close Pre-Join Lobby (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pre-Join Lobby Grid: Left Video Camera (60%) + Right Join Options (40%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT SIDE: Widescreen Camera Feed & Controls */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="relative aspect-video bg-[#121316] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                    {/* User Name Badge (Top-Left - Google Meet Style) */}
                    <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-white uppercase border border-white/10 shadow-md">
                      {userName}
                    </div>

                    {/* Live Video Feed or Fallback */}
                    {cameraEnabled ? (
                      <video
                        ref={(el) => {
                          videoRef.current = el;
                          if (el && streamRef.current) {
                            el.srcObject = streamRef.current;
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-[#16171a] p-6 text-center">
                        <div className="p-4 bg-white/5 rounded-full mb-3 border border-white/10">
                          <VideoOff className="w-10 h-10 text-gray-400 stroke-1" />
                        </div>
                        <p className="text-sm font-semibold text-white mb-1">Camera is off</p>
                        <p className="text-xs text-gray-400 max-w-xs">
                          Turn on your camera to preview your video before joining
                        </p>
                      </div>
                    )}

                    {/* Media Error Warning */}
                    {mediaError && (
                      <div className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-md text-black px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{mediaError}</span>
                      </div>
                    )}

                    {/* Floating Circular Controls (Mic, Cam, Effects) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-xl">
                      <button
                        type="button"
                        onClick={toggleMic}
                        className={`p-3 rounded-full transition-all active:scale-95 ${
                          micEnabled
                            ? "bg-white text-gray-900 hover:bg-gray-200 shadow-md"
                            : "bg-red-500 text-white hover:bg-red-600 shadow-md"
                        }`}
                        title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                      >
                        {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={toggleCamera}
                        className={`p-3 rounded-full transition-all active:scale-95 ${
                          cameraEnabled
                            ? "bg-white text-gray-900 hover:bg-gray-200 shadow-md"
                            : "bg-red-500 text-white hover:bg-red-600 shadow-md"
                        }`}
                        title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
                      >
                        {cameraEnabled ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        title="Visual Effects & Backgrounds"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Device Dropdown Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-gray-300">
                    <div className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                      <Mic className="w-3.5 h-3.5 text-blue-400" />
                      <span>{micEnabled ? "Microphone (Default)" : "Microphone Off"}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                      <VideoIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{cameraEnabled ? "Integrated Camera" : "Camera Off"}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: Ready to Join Section */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full pt-1">
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-2xl font-normal text-white mb-2 tracking-tight">
                        Ready to join?
                      </h3>
                      <p className="text-sm text-gray-400">
                        {verifiedRoom.participants?.length > 1
                          ? `${verifiedRoom.participants.length} developers in workspace`
                          : "No one else is here yet"}
                      </p>
                    </div>

                    {/* Join Actions */}
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        disabled={isJoining}
                        onClick={() => handleJoinSession(false)}
                        className="w-full py-3.5 px-6 bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-base rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 cursor-pointer disabled:opacity-70"
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <span>Join now</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleJoinSession(true)}
                        className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-200 font-medium text-xs rounded-full border border-white/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <Code className="w-4 h-4 text-blue-400" />
                        <span>Use Companion Mode (Code & Chat Only)</span>
                      </button>
                    </div>

                    {/* Secondary Links */}
                    <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5 text-xs text-gray-400">
                      <button
                        type="button"
                        onClick={() => handleJoinSession(false)}
                        className="flex items-center gap-2 hover:text-white transition-colors text-left"
                      >
                        <VideoIcon className="w-4 h-4 text-gray-400" />
                        <span>Present screen when entering</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVerifiedRoom(null);
                          setJoinCode("");
                          setIsFocused(true);
                        }}
                        className="flex items-center gap-2 hover:text-blue-400 transition-colors text-left"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                        <span>Enter a different code or link</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
