"use client";

import React, { useState } from "react";
import Avatar from "@/components/Avatar";
import { Mic, MicOff, Maximize2, Minimize2, ChevronDown, ChevronUp } from "lucide-react";

export default function WorkspaceVideoStrip({
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
  onExpandMeeting,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const localUserName = user?.fullName || user?.username || user?.name || "You";

  const peers = connectedUsers.map((peer) => {
    const isInCall = roomUsers.some(
      (ru) => ru.socketId === peer.socketId || ru.user?._id === peer.user?._id
    );
    const stream = remoteStreams[peer.socketId];
    const mediaState = remoteMediaStates[peer.socketId] || {
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
    };
  });

  const totalTiles = 1 + peers.length;

  return (
    <div className="fixed bottom-20 left-4 z-40 flex flex-col gap-2 transition-all duration-300 ease-out font-mono">
      {/* Header bar of floating strip */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5 font-bold text-neutral-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CALL ({totalTiles})</span>
        </div>

        <div className="flex items-center gap-1">
          {onExpandMeeting && (
            <button
              type="button"
              onClick={onExpandMeeting}
              className="p-1 hover:text-white transition-colors cursor-pointer"
              title="Expand to Full Meeting View"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Video Tiles" : "Minimize Video Tiles"}
          >
            {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Video Tiles List */}
      {!isCollapsed && (
        <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
          {/* Local User Tile */}
          <div className="relative w-48 sm:w-56 aspect-video bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden shadow-xl group">
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
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-neutral-400 bg-neutral-950">
                <Avatar
                  src={user?.avatar || user?.avatarUrl || null}
                  name={localUserName}
                  size={32}
                />
                <span className="text-[9px] text-neutral-500 uppercase">
                  {isJoinedCall ? "Camera Off" : "Not in Call"}
                </span>
              </div>
            )}

            <div className="absolute bottom-1.5 left-1.5 z-10 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white border border-white/10 flex items-center gap-1">
              <span className="truncate max-w-[90px]">{localUserName} (You)</span>
              {isJoinedCall && (
                <span>
                  {isMicMuted ? (
                    <MicOff className="w-2.5 h-2.5 text-red-400" />
                  ) : (
                    <Mic className="w-2.5 h-2.5 text-emerald-400" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Remote Peer Tiles */}
          {peers.map((peer) => (
            <div
              key={peer.socketId}
              className="relative w-48 sm:w-56 aspect-video bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden shadow-xl group"
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
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-neutral-400 bg-neutral-950">
                  <Avatar src={peer.avatar} name={peer.name} size={32} />
                  <span className="text-[9px] text-neutral-500 uppercase">
                    {peer.isInCall ? (peer.isCameraOff ? "Camera Off" : "In Call") : "In Room"}
                  </span>
                </div>
              )}

              <div className="absolute bottom-1.5 left-1.5 z-10 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white border border-white/10 flex items-center gap-1">
                <span className="truncate max-w-[90px]">{peer.name}</span>
                {peer.isInCall && (
                  <span>
                    {peer.isMicMuted ? (
                      <MicOff className="w-2.5 h-2.5 text-red-400" />
                    ) : (
                      <Mic className="w-2.5 h-2.5 text-emerald-400" />
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
