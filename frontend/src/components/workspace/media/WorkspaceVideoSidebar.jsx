"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Avatar from "@/components/Avatar";
import {
  Mic,
  MicOff,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  GripHorizontal,
  RotateCcw,
} from "lucide-react";

export default function WorkspaceVideoSidebar({
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
  const [width, setWidth] = useState(260);
  const [position, setPosition] = useState(() => {
    if (typeof window !== "undefined") {
      return {
        x: Math.max(16, window.innerWidth - 276),
        y: 16,
      };
    }
    return null;
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const isResizingRef = useRef(false);
  const resizeRef = useRef({ startX: 0, startWidth: 0, startPosX: 0, handle: "left" });

  const localUserName = user?.fullName || user?.username || user?.name || "You";

  // Snap back to default top-right position
  const snapToTopRight = useCallback(() => {
    if (typeof window !== "undefined") {
      const defaultX = Math.max(16, window.innerWidth - width - 16);
      setPosition({ x: defaultX, y: 16 });
    }
  }, [width]);

  // Handle Dragging anywhere on screen (Mouse & Touch)
  const handleDragStart = useCallback(
    (e) => {
      // Don't drag if clicking buttons
      if (e.target.closest("button") || e.target.closest("input")) return;

      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;

      setIsDragging(true);
      const curPos = position || {
        x: typeof window !== "undefined" ? window.innerWidth - width - 16 : 100,
        y: 16,
      };

      dragRef.current = {
        startX: clientX,
        startY: clientY,
        initialX: curPos.x,
        initialY: curPos.y,
      };

      const handleDragMove = (moveEvt) => {
        const curX = moveEvt.clientX ?? moveEvt.touches?.[0]?.clientX;
        const curY = moveEvt.clientY ?? moveEvt.touches?.[0]?.clientY;
        if (curX === undefined || curY === undefined) return;

        const deltaX = curX - dragRef.current.startX;
        const deltaY = curY - dragRef.current.startY;

        const curWidth = isCollapsed ? 140 : width;
        const maxX = Math.max(8, window.innerWidth - curWidth - 8);
        const maxY = Math.max(8, window.innerHeight - 80);

        const nextX = Math.min(Math.max(8, dragRef.current.initialX + deltaX), maxX);
        const nextY = Math.min(Math.max(8, dragRef.current.initialY + deltaY), maxY);

        setPosition({ x: nextX, y: nextY });
      };

      const handleDragEnd = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
      };

      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);
    },
    [position, width, isCollapsed]
  );

  // Handle Resizing (Left & Right handles)
  const handleResizeStart = useCallback(
    (e, handle = "left") => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      const curPos = position || {
        x: typeof window !== "undefined" ? window.innerWidth - width - 16 : 100,
        y: 16,
      };

      resizeRef.current = {
        startX: e.clientX,
        startWidth: width,
        startPosX: curPos.x,
        handle,
      };

      const handleResizeMove = (moveEvt) => {
        if (!isResizingRef.current) return;

        if (handle === "left") {
          const delta = resizeRef.current.startX - moveEvt.clientX;
          const newWidth = Math.min(480, Math.max(180, resizeRef.current.startWidth + delta));
          const newX = resizeRef.current.startPosX - (newWidth - resizeRef.current.startWidth);
          if (newX >= 8) {
            setWidth(newWidth);
            setPosition((prev) => ({ ...(prev || {}), x: newX }));
          }
        } else if (handle === "right") {
          const delta = moveEvt.clientX - resizeRef.current.startX;
          const newWidth = Math.min(480, Math.max(180, resizeRef.current.startWidth + delta));
          setWidth(newWidth);
        }
      };

      const handleResizeEnd = () => {
        isResizingRef.current = false;
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        window.removeEventListener("mousemove", handleResizeMove);
        window.removeEventListener("mouseup", handleResizeEnd);
      };

      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    },
    [position, width]
  );

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
    };
  });

  const totalTiles = 1 + peers.length;

  // Inline style for positioning the floating window
  const floatingStyle = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
      }
    : {
        top: "16px",
        right: "16px",
        width: `${width}px`,
      };

  if (isCollapsed) {
    const collapsedStyle = position
      ? { left: `${position.x}px`, top: `${position.y}px` }
      : { top: "16px", right: "16px" };

    return (
      <div
        className="fixed z-40 select-none"
        style={collapsedStyle}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-3 py-2 bg-neutral-950/95 hover:bg-neutral-900 border border-neutral-800 text-xs font-mono text-white shadow-2xl rounded-none transition-colors cursor-pointer group"
          title="Open Video Call Tiles (Drag to move)"
        >
          <GripHorizontal className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors cursor-grab" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Call ({totalTiles})</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className={`fixed max-h-[calc(100vh-100px)] z-40 flex bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 shadow-2xl font-mono select-none overflow-hidden transition-shadow ${
        isDragging ? "ring-2 ring-blue-500/80 shadow-blue-500/10 cursor-grabbing" : ""
      }`}
      style={floatingStyle}
    >
      {/* Left Edge Drag Handle to Resize */}
      <div
        onMouseDown={(e) => handleResizeStart(e, "left")}
        className="w-2 hover:w-2.5 h-full cursor-col-resize flex items-center justify-center hover:bg-blue-600/30 transition-colors group relative -ml-1 z-50 flex-shrink-0"
        title="Drag left edge to resize width"
      >
        <div className="w-[2px] h-8 bg-neutral-700 group-hover:bg-blue-500 rounded-full" />
      </div>

      {/* Main Video Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar - Draggable Handle */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onDoubleClick={snapToTopRight}
          className={`h-9 px-3 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 text-xs flex-shrink-0 cursor-grab active:cursor-grabbing select-none ${
            isDragging ? "bg-neutral-800" : ""
          }`}
          title="Click and drag to move anywhere on screen (Double-click to reset position)"
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-3.5 h-3.5 text-neutral-500 hover:text-white transition-colors" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-white tracking-wider text-[11px]">
              CALL ({totalTiles})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={snapToTopRight}
              className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-none transition-colors cursor-pointer"
              title="Reset to Top-Right"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            {onExpandMeeting && (
              <button
                type="button"
                onClick={onExpandMeeting}
                className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-none transition-colors cursor-pointer"
                title="Expand to Full Meeting View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-none transition-colors cursor-pointer"
              title="Collapse Video Window"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Video Tiles List */}
        <div className="flex flex-col gap-2 p-2.5 overflow-y-auto max-h-[calc(100vh-140px)] bg-neutral-950">
          {/* Local User Tile */}
          <div className="relative aspect-video w-full bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden shadow-md flex-shrink-0 group">
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
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-neutral-950 text-neutral-400">
                <Avatar
                  src={user?.avatar || user?.avatarUrl || null}
                  name={localUserName}
                  size={36}
                />
                <span className="text-[9px] text-neutral-500 uppercase">
                  {isJoinedCall ? "Camera Off" : "Not in Call"}
                </span>
              </div>
            )}

            <div className="absolute bottom-1.5 left-1.5 z-10 bg-black/80 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-white border border-white/10 flex items-center gap-1.5">
              <span className="truncate max-w-[110px]">{localUserName} (You)</span>
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

          {/* Remote Peers Tiles */}
          {peers.map((peer) => (
            <div
              key={peer.socketId}
              className="relative aspect-video w-full bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden shadow-md flex-shrink-0 group"
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
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-neutral-950 text-neutral-400">
                  <Avatar src={peer.avatar} name={peer.name} size={36} />
                  <span className="text-[9px] text-neutral-500 uppercase">
                    {peer.isInCall ? (peer.isCameraOff ? "Camera Off" : "In Call") : "In Room"}
                  </span>
                </div>
              )}

              <div className="absolute bottom-1.5 left-1.5 z-10 bg-black/80 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                <span className="truncate max-w-[110px]">{peer.name}</span>
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
      </div>

      {/* Right Edge Drag Handle to Resize */}
      <div
        onMouseDown={(e) => handleResizeStart(e, "right")}
        className="w-2 hover:w-2.5 h-full cursor-col-resize flex items-center justify-center hover:bg-blue-600/30 transition-colors group relative -mr-1 z-50 flex-shrink-0"
        title="Drag right edge to resize width"
      >
        <div className="w-[2px] h-8 bg-neutral-700 group-hover:bg-blue-500 rounded-full" />
      </div>
    </aside>
  );
}
