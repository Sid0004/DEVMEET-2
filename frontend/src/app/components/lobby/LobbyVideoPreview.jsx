"use client";

import React, { useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, Volume2, AlertCircle } from "lucide-react";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";
import LobbyDeviceDropdown from "./LobbyDeviceDropdown";

export default function LobbyVideoPreview({
  userName,
  videoRef,
  streamRef,
  mediaStream,
  cameraEnabled,
  micEnabled,
  mediaError,
  toggleCamera,
  toggleMic,
  audioDevices = [],
  speakerDevices = [],
  videoDevices = [],
  selectedAudioDevice = "",
  selectedSpeakerDevice = "",
  selectedVideoDevice = "",
  onAudioDeviceChange,
  onSpeakerDeviceChange,
  onVideoDeviceChange,
}) {
  const audioLevel = useAudioAnalyser(mediaStream, micEnabled);

  // Re-attach video stream whenever streamRef or cameraEnabled changes
  useEffect(() => {
    if (videoRef?.current && streamRef?.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [videoRef, streamRef, cameraEnabled]);

  return (
    <div className="lg:col-span-7 flex flex-col gap-4">
      {/* 16:9 Video Canvas Box */}
      <div className="relative aspect-video bg-[#121316] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
        {/* User Name Badge */}
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-white uppercase border border-white/10 shadow-md">
          {userName}
        </div>

        {/* Live Video Element - Kept mounted to prevent black screen */}
        <video
          ref={(el) => {
            if (videoRef) videoRef.current = el;
            if (el && streamRef?.current) {
              if (el.srcObject !== streamRef.current) {
                el.srcObject = streamRef.current;
              }
              el.play().catch(() => {});
            }
          }}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${
            cameraEnabled ? "block" : "hidden"
          }`}
        />

        {/* Camera Off Placeholder */}
        {!cameraEnabled && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1b1f] to-[#121316] gap-3">
            <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl font-bold uppercase shadow-inner">
              {userName ? userName[0] : "D"}
            </div>
            <p className="text-xs text-gray-400 font-medium">Camera is off</p>
          </div>
        )}

        {/* Media Warning Alert */}
        {mediaError && (
          <div className="absolute top-4 right-4 left-4 z-20 bg-amber-500/90 text-black font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg backdrop-blur-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{mediaError}</span>
          </div>
        )}

        {/* Floating Overlay Controls Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-2xl">
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-full transition-all duration-200 cursor-pointer ${
              micEnabled
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-red-600 hover:bg-red-500 text-white shadow-none"
            }`}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className={`p-3 rounded-full transition-all duration-200 cursor-pointer ${
              cameraEnabled
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-red-600 hover:bg-red-500 text-white shadow-none"
            }`}
            title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3 Hardware Device Popover Dropdowns: Microphone (with audio meter), Speakers (with test sound) & Camera */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full text-xs">
        <LobbyDeviceDropdown
          icon={Mic}
          devices={audioDevices}
          selectedDeviceId={selectedAudioDevice}
          onSelect={onAudioDeviceChange}
          placeholder="Microphone"
          type="mic"
          audioLevel={audioLevel}
        />

        <LobbyDeviceDropdown
          icon={Volume2}
          devices={speakerDevices}
          selectedDeviceId={selectedSpeakerDevice}
          onSelect={onSpeakerDeviceChange}
          placeholder="Speakers"
          type="speaker"
        />

        <LobbyDeviceDropdown
          icon={Video}
          devices={videoDevices}
          selectedDeviceId={selectedVideoDevice}
          onSelect={onVideoDeviceChange}
          placeholder="Camera"
          type="video"
        />
      </div>
    </div>
  );
}
