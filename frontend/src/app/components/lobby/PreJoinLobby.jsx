"use client";

import React from "react";
import { motion } from "framer-motion";
import LobbyHeader from "./LobbyHeader";
import LobbyVideoPreview from "./LobbyVideoPreview";
import LobbyJoinActions from "./LobbyJoinActions";

export default function PreJoinLobby({
  verifiedRoom,
  userName,
  videoRef,
  streamRef,
  mediaStream,
  cameraEnabled,
  micEnabled,
  mediaError,
  audioDevices,
  speakerDevices,
  videoDevices,
  selectedAudioDevice,
  selectedSpeakerDevice,
  selectedVideoDevice,
  onAudioDeviceChange,
  onSpeakerDeviceChange,
  onVideoDeviceChange,
  toggleCamera,
  toggleMic,
  isJoining,
  loaderText,
  onJoin,
  onClose,
  onReset,
}) {
  if (!verifiedRoom) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4 sm:p-6 overflow-y-auto">
      <motion.div
        key="verified-lobby-modal"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="w-full max-w-5xl bg-[#1e1f24] border border-white/15 rounded-3xl text-white shadow-2xl p-6 sm:p-8 flex flex-col gap-6 my-auto"
      >
        <LobbyHeader verifiedRoom={verifiedRoom} onClose={onClose} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <LobbyVideoPreview
            userName={userName}
            videoRef={videoRef}
            streamRef={streamRef}
            mediaStream={mediaStream}
            cameraEnabled={cameraEnabled}
            micEnabled={micEnabled}
            mediaError={mediaError}
            audioDevices={audioDevices}
            speakerDevices={speakerDevices}
            videoDevices={videoDevices}
            selectedAudioDevice={selectedAudioDevice}
            selectedSpeakerDevice={selectedSpeakerDevice}
            selectedVideoDevice={selectedVideoDevice}
            onAudioDeviceChange={onAudioDeviceChange}
            onSpeakerDeviceChange={onSpeakerDeviceChange}
            onVideoDeviceChange={onVideoDeviceChange}
            toggleCamera={toggleCamera}
            toggleMic={toggleMic}
          />

          <LobbyJoinActions
            verifiedRoom={verifiedRoom}
            isJoining={isJoining}
            loaderText={loaderText}
            onJoin={onJoin}
            onReset={onReset}
          />
        </div>
      </motion.div>
    </div>
  );
}
