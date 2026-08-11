"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Loader2,
  Code,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreJoinLobbyModal({ isOpen, roomId, onClose }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [mediaError, setMediaError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Initialize Media Devices on Modal Open
  useEffect(() => {
    if (isOpen) {
      const setupMedia = async () => {
        setMediaError(null);
        setIsReady(false);
        setIsJoining(false);

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
          setIsReady(true);
        } catch (err) {
          console.warn("Media devices warning:", err);
          setMediaError("Camera or Microphone not detected");
          setIsReady(true);
        }
      };

      setupMedia();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

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

  const handleJoinNow = () => {
    setIsJoining(true);
    sessionStorage.setItem(`devmeet_mic_pref_${roomId}`, micEnabled ? "true" : "false");
    sessionStorage.setItem(`devmeet_cam_pref_${roomId}`, cameraEnabled ? "true" : "false");
    sessionStorage.removeItem(`devmeet_no_vc_${roomId}`);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setTimeout(() => {
      router.push(`/workspace?room=${roomId}`);
    }, 400);
  };

  const handleJoinWithoutVC = () => {
    setIsJoining(true);
    sessionStorage.setItem(`devmeet_mic_pref_${roomId}`, "false");
    sessionStorage.setItem(`devmeet_cam_pref_${roomId}`, "false");
    sessionStorage.setItem(`devmeet_no_vc_${roomId}`, "true");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setTimeout(() => {
      router.push(`/workspace?room=${roomId}`);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Green Room Lobby Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#1e1f24] border border-white/10 rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden p-6 md:p-8 text-white z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-normal text-white tracking-tight mb-1">
              Ready to join?
            </h2>
            <p className="text-xs text-gray-400 font-normal">
              Workspace session #{roomId}
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-center">
            {/* Live Camera Video Box */}
            <div className="md:col-span-7 relative bg-[#121316] border border-white/10 rounded-2xl overflow-hidden aspect-video flex items-center justify-center group shadow-inner">
              {cameraEnabled && !mediaError ? (
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && streamRef.current && el.srcObject !== streamRef.current) {
                      el.srcObject = streamRef.current;
                      el.play().catch((e) => console.warn("Video play warning:", e));
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400">
                  <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center mb-2.5 border border-white/10">
                    <VideoOff className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-xs font-normal text-gray-300">
                    Camera is off
                  </span>
                </div>
              )}

              {/* In-Video Media Controls Overlay */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-full transition-colors ${
                    micEnabled
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-red-500/80 text-white"
                  }`}
                  title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-full transition-colors ${
                    cameraEnabled
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-red-500/80 text-white"
                  }`}
                  title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {cameraEnabled ? (
                    <VideoIcon className="w-4 h-4" />
                  ) : (
                    <VideoOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Right Status & Join Actions */}
            <div className="md:col-span-5 flex flex-col gap-5">
              {/* Media Diagnostics Status Card */}
              <div className="p-4 bg-[#141518] border border-white/10 rounded-2xl flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                  {mediaError ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-200">
                          {mediaError}
                        </p>
                        <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                          You can still join in code editor & text chat mode.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-emerald-300">
                          Check complete
                        </p>
                        <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                          Camera & Microphone active
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1.5 font-normal">
                    <Volume2 className="w-3.5 h-3.5 text-gray-400" /> Audio Level
                  </span>
                  <span className="text-emerald-400 font-semibold">Normal</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleJoinNow}
                  disabled={isJoining}
                  className="w-full h-12 bg-[#c2e7ff] hover:bg-[#b3dcf7] text-[#001d35] font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Entering Workspace...
                    </>
                  ) : (
                    <>
                      Join Session <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleJoinWithoutVC}
                  disabled={isJoining}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-gray-200 hover:text-white font-medium text-xs rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <Code className="w-3.5 h-3.5" /> Code & Chat Only (No VC)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
