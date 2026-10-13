"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Code,
  Palette,
  MessageSquare,
  Users,
  Settings,
  PhoneOff,
  PhoneCall,
  LayoutGrid,
  Link2,
  Check,
  Download,
} from "lucide-react";

export default function WorkspaceControlBar({
  isJoinedCall,
  startCall,
  leaveCall,
  isMicMuted,
  toggleMic,
  isCameraOff,
  toggleCamera,
  isScreenSharing,
  toggleScreenShare,
  viewMode, // "meeting" | "code" | "whiteboard"
  setViewMode,
  sideDrawer, // "none" | "chat" | "members" | "settings"
  setSideDrawer,
  unreadCount = 0,
  connectedUsersCount = 1,
  onCopyInvite,
  copiedInvite = false,
  onDownloadCode,
}) {
  const toggleDrawer = (drawerName) => {
    if (sideDrawer === drawerName) {
      setSideDrawer("none");
    } else {
      setSideDrawer(drawerName);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 bg-neutral-950/90 backdrop-blur-xl border border-neutral-800 shadow-2xl rounded-none text-xs font-mono">
      {/* 1. Media Controls */}
      {isJoinedCall ? (
        <div className="flex items-center gap-1.5 pr-2 border-r border-neutral-800">
          {/* Mic Toggle */}
          <button
            type="button"
            onClick={toggleMic}
            className={`h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
              isMicMuted
                ? "bg-red-500/15 hover:bg-red-500/25 border-red-500/40 text-red-400"
                : "bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white"
            }`}
            title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMicMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline font-bold">{isMicMuted ? "Muted" : "Mic"}</span>
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
              isCameraOff
                ? "bg-red-500/15 hover:bg-red-500/25 border-red-500/40 text-red-400"
                : "bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white"
            }`}
            title={isCameraOff ? "Turn On Camera" : "Turn Off Camera"}
          >
            {isCameraOff ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4 text-blue-400" />}
            <span className="hidden sm:inline font-bold">{isCameraOff ? "Cam Off" : "Cam"}</span>
          </button>

          {/* Screen Share */}
          {toggleScreenShare && (
            <button
              type="button"
              onClick={toggleScreenShare}
              className={`h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
                isScreenSharing
                  ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                  : "bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white"
              }`}
              title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
            >
              <ScreenShare className="w-4 h-4" />
              <span className="hidden md:inline font-bold">Share</span>
            </button>
          )}
        </div>
      ) : (
        <div className="pr-2 border-r border-neutral-800">
          <button
            type="button"
            onClick={startCall}
            className="h-10 px-4 flex items-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold transition-all cursor-pointer rounded-none border border-[#1a73e8] shadow-xs"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Join Live Call</span>
          </button>
        </div>
      )}

      {/* 2. Workspace View Mode Switchers */}
      <div className="flex items-center gap-1 px-1">
        {/* Meeting View Button */}
        <button
          type="button"
          onClick={() => setViewMode("meeting")}
          className={`h-10 px-3.5 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
            viewMode === "meeting"
              ? "bg-white text-neutral-950 font-bold border-white"
              : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
          }`}
          title="Meeting Video View"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline">Meeting</span>
        </button>

        {/* Code Editor Button */}
        <button
          type="button"
          onClick={() => setViewMode(viewMode === "code" ? "meeting" : "code")}
          className={`h-10 px-3.5 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
            viewMode === "code"
              ? "bg-[#1a73e8] text-white font-bold border-blue-400 shadow-xs"
              : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
          }`}
          title="Code IDE Workspace"
        >
          <Code className="w-4 h-4" />
          <span className="hidden sm:inline">Code IDE</span>
        </button>

        {/* Whiteboard Button */}
        <button
          type="button"
          onClick={() => setViewMode(viewMode === "whiteboard" ? "meeting" : "whiteboard")}
          className={`h-10 px-3.5 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
            viewMode === "whiteboard"
              ? "bg-purple-600 text-white font-bold border-purple-400 shadow-xs"
              : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
          }`}
          title="Collaborative Whiteboard"
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Whiteboard</span>
        </button>
      </div>

      {/* 3. Utility Drawers (Chat / Members / Settings) */}
      <div className="flex items-center gap-1 pl-1 border-l border-neutral-800">
        {/* Chat Drawer Toggle */}
        <button
          type="button"
          onClick={() => toggleDrawer("chat")}
          className={`h-10 px-3 flex items-center gap-1.5 relative transition-all cursor-pointer rounded-none border ${
            sideDrawer === "chat"
              ? "bg-neutral-800 text-white border-neutral-600"
              : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
          }`}
          title="Toggle Team Chat"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden md:inline">Chat</span>
          {unreadCount > 0 && (
            <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center -ml-0.5">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Members Drawer Toggle */}
        <button
          type="button"
          onClick={() => toggleDrawer("members")}
          className={`h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
            sideDrawer === "members"
              ? "bg-neutral-800 text-white border-neutral-600"
              : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
          }`}
          title="Session Members"
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-bold text-neutral-400">({connectedUsersCount})</span>
        </button>

        {/* Invite Link Button */}
        {onCopyInvite && (
          <button
            type="button"
            onClick={onCopyInvite}
            className={`h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
              copiedInvite
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white"
            }`}
            title="Copy Meeting Invite Link"
          >
            {copiedInvite ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4 text-blue-400" />}
            <span className="hidden sm:inline font-bold">{copiedInvite ? "Copied" : "Invite"}</span>
          </button>
        )}

        {/* Download Code Button (when in code view) */}
        {viewMode === "code" && onDownloadCode && (
          <button
            type="button"
            onClick={onDownloadCode}
            className="h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white"
            title="Download Active File"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline font-bold">Export</span>
          </button>
        )}
      </div>

      {/* 4. End Call Button */}
      {isJoinedCall && (
        <div className="pl-1 border-l border-neutral-800">
          <button
            type="button"
            onClick={leaveCall}
            className="h-10 px-3.5 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold transition-all cursor-pointer rounded-none border border-red-500 shadow-xs"
            title="Leave Video Call"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      )}
    </div>
  );
}
