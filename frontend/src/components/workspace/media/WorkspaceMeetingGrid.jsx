"use client";

import React, { useMemo, useState } from "react";
import Avatar from "@/components/Avatar";
import {
  Mic,
  MicOff,
  PhoneCall,
  LayoutGrid,
  Maximize2,
  ShieldCheck,
  Copy,
  Check,
  Users,
} from "lucide-react";
import { resolveMeetingPeers } from "@/utils/resolveMeetingPeers";

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
  const [layoutMode, setLayoutMode] = useState("grid"); // "grid" | "spotlight"
  const [spotlightId, setSpotlightId] = useState("local");
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAiTooltip, setShowAiTooltip] = useState(false);

  // Collect all participants (Self + Connected Peers)
  const peers = useMemo(
    () =>
      resolveMeetingPeers({
        currentUser: user,
        connectedUsers,
        roomUsers,
        remoteStreams,
        remoteMediaStates,
      }),
    [user, connectedUsers, roomUsers, remoteStreams, remoteMediaStates]
  );

  const totalTiles = 1 + peers.length;
  const localUserName = user?.fullName || user?.username || user?.name || "You";

  const handleCopyInvite = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Determine active spotlight tile
  const activeSpotlight =
    spotlightId === "local"
      ? { isLocal: true, name: `${localUserName} (You)`, isCameraOff, isMicMuted, stream: localStream, avatar: user?.avatar || user?.avatarUrl, inCall: isJoinedCall }
      : (() => {
          const peer = peers.find((p) => p.socketId === spotlightId) || peers[0];
          return peer
            ? { isLocal: false, name: peer.name, isCameraOff: peer.isCameraOff, isMicMuted: peer.isMicMuted, stream: peer.stream, avatar: peer.avatar, inCall: peer.isInCall, socketId: peer.socketId }
            : { isLocal: true, name: `${localUserName} (You)`, isCameraOff, isMicMuted, stream: localStream, avatar: user?.avatar || user?.avatarUrl, inCall: isJoinedCall };
        })();

  // Compute Grid column class based on participant count
  const gridClass =
    totalTiles === 1
      ? "grid-cols-1 max-w-4xl"
      : totalTiles === 2
      ? "grid-cols-1 md:grid-cols-2 max-w-5xl"
      : totalTiles <= 4
      ? "grid-cols-1 sm:grid-cols-2 max-w-6xl"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-7xl";

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto bg-neutral-950 pb-28 select-none">
      {/* Top Floating Header: Layout Switcher + AI Sentinel Badge */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-1 pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={() => setLayoutMode("grid")}
            className={`px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-mono transition-colors cursor-pointer ${
              layoutMode === "grid"
                ? "bg-white text-neutral-950 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Grid View (All participants balanced)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("spotlight")}
            className={`px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-mono transition-colors cursor-pointer ${
              layoutMode === "spotlight"
                ? "bg-white text-neutral-950 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Spotlight View (Focused active speaker tile)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Spotlight</span>
          </button>
        </div>

        {/* Right: Refined Minimalist Room Security Badge */}
        <div className="relative pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 text-xs font-mono text-neutral-300 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-neutral-200">E2E Encrypted</span>
            <span className="text-[10px] text-neutral-400 bg-neutral-800 border border-neutral-700 px-1.5 py-0.2">
              Agent Beta
            </span>
          </div>
        </div>
      </div>

      {/* Main Video Arena */}
      <div className="w-full flex-1 flex flex-col items-center justify-center pt-10">
        {layoutMode === "grid" ? (
          /* GRID VIEW */
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
        ) : (
          /* SPOTLIGHT / MAIN TILE VIEW */
          <div className="w-full max-w-6xl flex flex-col items-center gap-3">
            {/* Large Focused Tile */}
            <div className="relative aspect-video w-full bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden flex items-center justify-center shadow-2xl group">
              {activeSpotlight.inCall && activeSpotlight.stream && !activeSpotlight.isCameraOff ? (
                <video
                  ref={(el) => {
                    if (el && el.srcObject !== activeSpotlight.stream) {
                      el.srcObject = activeSpotlight.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${activeSpotlight.isLocal ? "transform -scale-x-100" : ""}`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-neutral-400 p-6">
                  <div className="w-24 h-24 bg-neutral-800 border border-neutral-700 rounded-none flex items-center justify-center text-white text-3xl font-bold font-mono">
                    <Avatar src={activeSpotlight.avatar} name={activeSpotlight.name} size={80} />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                    {activeSpotlight.inCall ? (activeSpotlight.isCameraOff ? "Camera Off" : "In Call") : "Not in Call"}
                  </span>
                </div>
              )}

              {/* Spotlight Name Badge */}
              <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 text-xs font-mono font-bold text-white border border-white/10 flex items-center gap-2">
                <span>{activeSpotlight.name}</span>
                {activeSpotlight.inCall && (
                  <span>
                    {activeSpotlight.isMicMuted ? (
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Carousel Below Main Tile */}
            <div className="flex items-center gap-2 overflow-x-auto w-full py-1">
              {/* Local Thumbnail */}
              <button
                type="button"
                onClick={() => setSpotlightId("local")}
                className={`relative w-36 aspect-video bg-neutral-900 border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                  spotlightId === "local" ? "border-blue-500 ring-2 ring-blue-500/50" : "border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="text-[10px] font-mono text-neutral-300 truncate px-1">
                  {localUserName} (You)
                </div>
              </button>

              {/* Peer Thumbnails */}
              {peers.map((peer) => (
                <button
                  key={peer.socketId}
                  type="button"
                  onClick={() => setSpotlightId(peer.socketId)}
                  className={`relative w-36 aspect-video bg-neutral-900 border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                    spotlightId === peer.socketId ? "border-blue-500 ring-2 ring-blue-500/50" : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="text-[10px] font-mono text-neutral-300 truncate px-1">
                    {peer.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Solo Meeting Banner: when 1 user is alone in the room */}
        {totalTiles === 1 && (
          <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-neutral-900/60 border border-neutral-800 font-mono text-xs text-neutral-400">
            <Users className="w-4 h-4 text-blue-400" />
            <span>You&apos;re the only one in this meeting room.</span>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="ml-2 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-bold border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-300" />}
              <span>{copiedLink ? "Link Copied" : "Copy Invite Link"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
