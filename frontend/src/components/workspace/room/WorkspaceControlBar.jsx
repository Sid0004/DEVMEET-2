"use client";

import React, { useState, useRef, useEffect } from "react";
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
  MoreVertical,
  LogOut,
  AlertTriangle,
  X,
} from "lucide-react";

export default function WorkspaceControlBar({
  isJoinedCall,
  startCall,
  leaveCall,
  onLeaveMeeting,
  onEndSession,
  isHost = false,
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const moreMenuRef = useRef(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMoreMenu]);

  const toggleDrawer = (drawerName) => {
    if (sideDrawer === drawerName) {
      setSideDrawer("none");
    } else {
      setSideDrawer(drawerName);
    }
  };

  const handleLeave = () => {
    setShowEndModal(false);
    if (onLeaveMeeting) {
      onLeaveMeeting();
    } else if (leaveCall) {
      leaveCall();
    }
  };

  const handleEndForAll = () => {
    setShowEndModal(false);
    if (onEndSession) {
      onEndSession();
    } else if (onLeaveMeeting) {
      onLeaveMeeting();
    }
  };

  return (
    <>
      {/* Central Google-Meet Style Floating Control Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 shadow-2xl rounded-none text-xs font-mono select-none">
        {/* Category 1: Core AV Controls */}
        {isJoinedCall ? (
          <div className="flex items-center gap-1.5 pr-2 border-r border-neutral-800">
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleMic}
              className={`h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
                isMicMuted
                  ? "bg-red-500/15 hover:bg-red-500/25 border-red-500/40 text-red-400"
                  : "bg-neutral-900 hover:bg-neutral-850 border-neutral-700 text-white"
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
                  : "bg-neutral-900 hover:bg-neutral-850 border-neutral-700 text-white"
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
                    : "bg-neutral-900 hover:bg-neutral-850 border-neutral-700 text-neutral-300 hover:text-white"
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

        {/* Category 2: Segmented Workspace Views (Meeting / Code IDE / Whiteboard) */}
        <div className="flex items-center gap-1 px-1">
          <button
            type="button"
            onClick={() => setViewMode("meeting")}
            className={`h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
              viewMode === "meeting"
                ? "bg-white text-neutral-950 font-bold border-white"
                : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Meeting Video View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Meeting</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === "code" ? "meeting" : "code")}
            className={`h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
              viewMode === "code"
                ? "bg-[#1a73e8] text-white font-bold border-blue-400 shadow-xs"
                : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Code IDE Workspace"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Code IDE</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === "whiteboard" ? "meeting" : "whiteboard")}
            className={`h-10 px-3 flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
              viewMode === "whiteboard"
                ? "bg-purple-600 text-white font-bold border-purple-400 shadow-xs"
                : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Collaborative Whiteboard"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Whiteboard</span>
          </button>
        </div>

        {/* Category 3: Interaction & Utilities (Chat / Members / More Options) */}
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
              <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center -ml-0.5 animate-pulse">
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
            <span className="text-[11px] font-bold text-neutral-400">({connectedUsersCount})</span>
          </button>

          {/* More Options (...) Popup Button */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`h-10 px-2.5 flex items-center justify-center transition-all cursor-pointer rounded-none border ${
                showMoreMenu
                  ? "bg-neutral-800 text-white border-neutral-600"
                  : "bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* More Options Dropdown Menu */}
            {showMoreMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-neutral-950 border border-neutral-800 shadow-2xl p-1 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                {/* Copy Invite Link */}
                {onCopyInvite && (
                  <button
                    type="button"
                    onClick={() => {
                      onCopyInvite();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-neutral-900 text-neutral-300 hover:text-white text-xs text-left transition-colors cursor-pointer"
                  >
                    {copiedInvite ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Link2 className="w-4 h-4 text-blue-400" />
                    )}
                    <span>{copiedInvite ? "Link Copied!" : "Copy Invite Link"}</span>
                  </button>
                )}

                {/* Export Active Code File */}
                {onDownloadCode && (
                  <button
                    type="button"
                    onClick={() => {
                      onDownloadCode();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-neutral-900 text-neutral-300 hover:text-white text-xs text-left transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download Active Code</span>
                  </button>
                )}

                {/* Room Settings */}
                <button
                  type="button"
                  onClick={() => {
                    toggleDrawer("members");
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-neutral-900 text-neutral-300 hover:text-white text-xs text-left transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <span>Room &amp; Audio Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category 4: End / Leave Meeting Action */}
        <div className="pl-1 border-l border-neutral-800">
          <button
            type="button"
            onClick={() => setShowEndModal(true)}
            className="h-10 px-3.5 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold transition-all cursor-pointer rounded-none border border-red-500 shadow-xs"
            title={isHost ? "End or Leave Session" : "Leave Meeting"}
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">{isHost ? "Leave / End" : "Leave"}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Host & Participants */}
      {showEndModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 shadow-2xl p-6 font-mono text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>{isHost ? "End or Leave Meeting" : "Leave Meeting"}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 mb-6 leading-relaxed">
              {isHost
                ? "You are the host of this workspace session. You can end the meeting for all participants, or leave the meeting while allowing other collaborators to continue."
                : "Are you sure you want to exit this DevMeet workspace? You can rejoin anytime from your dashboard or invite link."}
            </p>

            <div className="flex flex-col gap-2.5">
              {isHost && (
                <button
                  type="button"
                  onClick={handleEndForAll}
                  className="w-full h-11 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-red-500 cursor-pointer shadow-md"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Meeting For Everyone</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLeave}
                className="w-full h-11 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-neutral-700 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isHost ? "Just Leave Meeting" : "Leave Meeting"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="w-full h-9 px-4 bg-transparent hover:bg-neutral-900 text-neutral-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
