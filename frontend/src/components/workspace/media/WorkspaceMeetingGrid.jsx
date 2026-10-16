"use client";

import React from "react";
import Avatar from "@/components/Avatar";
import { Mic, MicOff, Video, VideoOff, PhoneCall } from "lucide-react";

export default function WorkspaceMeetingGrid({
  user,
  isJoinedCall,
  startCall,
  localStream,
  isCameraOff,
  isMicMuted,
  connectedUsers = [],
  roomUsers = [],
  remoteStreams = {},
  remoteMediaStates = {},
}) {
  // Collect all participants (Self + Connected Peers)
  const peers = connectedUsers.map((peer) => {
    const peerId = peer.user?._id ? String(peer.user._id) : peer.socketId;
    const isInCall = roomUsers.some(
      (ru) => ru.socketId === peer.socketId || ru.identity === peerId || ru.user?._id === peer.user?._id
    );
    const stream = remoteStreams[peerId] || remoteStreams[peer.socketId];
    const mediaState = remoteMediaStates[peerId] || remoteMediaStates[peer.socketId] || {
      isCameraOff: true,
      isMicMuted: true,
    };

    return {
      socketId: peer.socketId,
      name: peer.user?.fullName || peer.user?.username || peer.user?.name || "Peer",
      avatar: peer.user?.avatar || peer.user?.avatarUrl || null,
      isInCall,
      stream,
      isCameraOff: mediaState.isCameraOff,
      isMicMuted: mediaState.isMicMuted,
      isMe: false,
    };
  });

  const totalTiles = 1 + peers.length;

  // Compute Grid column class based on participant count
  const gridClass =
    totalTiles === 1
      ? "grid-cols-1 max-w-4xl"
      : totalTiles === 2
      ? "grid-cols-1 md:grid-cols-2 max-w-5xl"
      : totalTiles <= 4
      ? "grid-cols-1 sm:grid-cols-2 max-w-6xl"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-7xl";

  const localUserName = user?.fullName || user?.username || user?.name || "You";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto bg-neutral-950 pb-24">
      <div className={`grid ${gridClass} gap-4 w-full aspect-auto items-center justify-center`}>
        {/* 1. Local User Video Tile */}
        <div className="relative aspect-video w-full bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden flex items-center justify-center shadow-lg group">
          {isJoinedCall && localStream && !isCameraOff ? (
            <video
              ref={(el) => {
                if (el && el.srcObject !== localStream) {
                  el.srcObject = localStream;
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-neutral-400 p-4">
              <div className="w-20 h-20 bg-neutral-800 border border-neutral-700 rounded-none flex items-center justify-center text-white text-2xl font-bold font-mono">
                <Avatar
                  src={user?.avatar || user?.avatarUrl || null}
                  name={localUserName}
                  size={64}
                />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                {isJoinedCall ? "Camera Off" : "Not in Call"}
              </span>
              {!isJoinedCall && (
                <button
                  type="button"
                  onClick={startCall}
                  className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold font-mono rounded-none transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Join Live Call</span>
                </button>
              )}
            </div>
          )}

          {/* User Name Badge */}
          <div className="absolute top-3 left-3 z-10 bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-mono font-bold text-white border border-white/10 flex items-center gap-2">
            <span>{localUserName} (You)</span>
            {isJoinedCall && (
              <span>
                {isMicMuted ? (
                  <MicOff className="w-3 h-3 text-red-400" />
                ) : (
                  <Mic className="w-3 h-3 text-emerald-400" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* 2. Remote Peers Video Tiles */}
        {peers.map((peer) => (
          <div
            key={peer.socketId}
            className="relative aspect-video w-full bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden flex items-center justify-center shadow-lg group"
          >
            {peer.isInCall && peer.stream && !peer.isCameraOff ? (
              <video
                ref={(el) => {
                  if (el && el.srcObject !== peer.stream) {
                    el.srcObject = peer.stream;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-neutral-400 p-4">
                <div className="w-20 h-20 bg-neutral-800 border border-neutral-700 rounded-none flex items-center justify-center text-white text-2xl font-bold font-mono">
                  <Avatar src={peer.avatar} name={peer.name} size={64} />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  {peer.isInCall ? (peer.isCameraOff ? "Camera Off" : "In Call") : "In Room"}
                </span>
              </div>
            )}

            {/* Peer Name Badge */}
            <div className="absolute top-3 left-3 z-10 bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-mono font-bold text-white border border-white/10 flex items-center gap-2">
              <span>{peer.name}</span>
              {peer.isInCall && (
                <span>
                  {peer.isMicMuted ? (
                    <MicOff className="w-3 h-3 text-red-400" />
                  ) : (
                    <Mic className="w-3 h-3 text-emerald-400" />
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
