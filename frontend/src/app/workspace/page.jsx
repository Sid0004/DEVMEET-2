"use client";

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { X } from "lucide-react";

import styles from "./workspace.module.css";
import { API_BASE_URL, apiRequest } from "../../lib/api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useTheme } from "@/components/ThemeProvider";
import { resetUnread } from "@/redux/features/chatSlice";
import LeftMeetingScreen from "../components/LeftMeetingScreen";

// Modular Workspace Subsystems
import ChatPanel from "@/components/workspace/chat/ChatPanel";
import WorkspaceControlBar from "@/components/workspace/room/WorkspaceControlBar";
import WorkspaceMeetingGrid from "@/components/workspace/media/WorkspaceMeetingGrid";
import WorkspaceWhiteboard from "@/components/workspace/whiteboard/WorkspaceWhiteboard";
import WorkspaceVideoSidebar from "@/components/workspace/media/WorkspaceVideoSidebar";
import GuestJoinModal from "@/components/workspace/room/GuestJoinModal";
import RoomStatusScreen from "@/components/workspace/room/RoomStatusScreen";
import AudioStreamManager from "@/components/workspace/media/AudioStreamManager";

// Custom Domain Hooks
import { useWorkspaceRoom } from "@/hooks/useWorkspaceRoom";
import useLiveKitMedia from "@/hooks/useLiveKitMedia";


// Dynamic Client-Only Developer IDE (avoids SSR window errors with Monaco & Yjs)
const CodeStudio = dynamic(
  () => import("@/components/workspace/ide/CodeStudio"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-neutral-400 font-mono text-xs">
        Loading DevMeet Code Studio...
      </div>
    ),
  }
);

// Helper for auditory cues on user entry/exit
const playNotificationSound = (isJoin) => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (isJoin) {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    console.warn("Audio cue error:", e);
  }
};

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div
          className={styles.layout}
          style={{
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
          }}
        >
          Loading DevMeet workspace...
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");
  const isNoVC = searchParams.get("novc") === "true";
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.chat);
  const { theme } = useTheme();

  // Dynamic Workspace View Modes ("meeting" | "code" | "whiteboard")
  const [viewMode, setViewMode] = useState(isNoVC ? "code" : "meeting");
  const [sideDrawer, setSideDrawer] = useState("none"); // "none" | "chat" | "members"

  // Code files & editor state
  const [files, setFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Meeting states
  const [hasLeftMeeting, setHasLeftMeeting] = useState(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Editor Preferences
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorMinimap, setEditorMinimap] = useState(false);
  const [editorWordWrap, setEditorWordWrap] = useState("on");
  const [editorTabSize, setEditorTabSize] = useState(2);
  const [editorLineNumbers, setEditorLineNumbers] = useState("on");
  const [soundNotifications, setSoundNotifications] = useState(true);
  const soundNotificationsRef = useRef(soundNotifications);

  useEffect(() => {
    soundNotificationsRef.current = soundNotifications;
  }, [soundNotifications]);

  // Reset unread count when user opens chat drawer
  useEffect(() => {
    if (sideDrawer === "chat") {
      dispatch(resetUnread());
    }
  }, [sideDrawer, dispatch]);

  // Compute resolved editor theme
  const isDarkTheme = theme !== "light";
  const editorTheme = isDarkTheme ? "vs-dark" : "vs";

  // Lock body scroll on workspace page to prevent layout shifts
  useLayoutEffect(() => {
    document.documentElement.classList.add("workspace-active");
    document.body.classList.add("workspace-active");
    return () => {
      document.documentElement.classList.remove("workspace-active");
      document.body.classList.remove("workspace-active");
    };
  }, []);

  // Prevent accidental tab close during live session
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave the active DevMeet workspace?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Load user editor preferences from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      if (typeof window !== "undefined") {
        const fs = localStorage.getItem("devmeet_editor_font_size");
        if (fs) setEditorFontSize(parseInt(fs, 10));

        const mini = localStorage.getItem("devmeet_editor_minimap");
        if (mini) setEditorMinimap(mini === "true");

        const wrap = localStorage.getItem("devmeet_editor_word_wrap");
        if (wrap) setEditorWordWrap(wrap === "true" ? "on" : "off");

        const ts = localStorage.getItem("devmeet_editor_tab_size");
        if (ts) setEditorTabSize(parseInt(ts, 10));

        const ln = localStorage.getItem("devmeet_editor_line_numbers");
        if (ln) setEditorLineNumbers(ln === "true" ? "on" : "off");

        const sounds = localStorage.getItem("devmeet_notifications_sound");
        if (sounds) setSoundNotifications(sounds === "true");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);


  // Stable callbacks for room events to prevent render churn
  const handleFilesReceived = useCallback((newFiles) => {
    setFiles((prev) => (prev.length === 0 ? newFiles : prev));
  }, []);

  const handleSoundNotification = useCallback((isJoin) => {
    if (soundNotificationsRef.current) playNotificationSound(isJoin);
  }, []);

  // 1. Room Gateway & Socket Subsystem Hook
  const {
    roomStatus,
    roomError,
    roomName,
    roomHost,
    socket,
    connectedUsers,
    isGuestModalOpen,
    publicRoomInfo,
    handleGuestJoinSuccess,
    retryConnection,
  } = useWorkspaceRoom({
    roomId,
    isMounted,
    onFilesReceived: handleFilesReceived,
    onSoundNotification: handleSoundNotification,
    sideDrawer,
  });


  // 2. LiveKit SFU Subsystem Hook (Adaptive simulcast, dynacast & background audio)
  const {
    localStream,
    remoteStreams,
    remoteMediaStates,
    roomUsers,
    isJoinedCall,
    isMicMuted,
    isCameraOff,
    isScreenSharing,
    startCall,
    leaveCall,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  } = useLiveKitMedia({
    roomId,
    user,
  });


  // Action Handlers
  const handleCopyInviteLink = () => {
    if (typeof window !== "undefined" && roomId) {
      const inviteUrl = `${window.location.origin}/workspace?room=${roomId}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedInviteLink(true);
      setTimeout(() => setCopiedInviteLink(false), 2500);
    }
  };

  const handleDownloadCode = () => {
    const activeFile = files[activeFileIndex];
    if (!activeFile) return;
    const blob = new Blob([activeFile.content || ""], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activeFile.name || "code.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEndSession = async () => {
    try {
      await apiRequest(`/api/v1/rooms/${roomId}/end`, { method: "POST" });
      if (socket) {
        socket.emit("end-session-broadcast", { roomId });
      }
    } catch (err) {
      console.warn("End session notice:", err);
    }
    setHasLeftMeeting(true);
  };

  // Screen 1: Room Gatekeeper (404, Locked, Ended, or Error)
  if (roomStatus !== "active" && roomStatus !== "loading") {
    return (
      <RoomStatusScreen
        status={roomStatus}
        message={roomError}
        roomId={roomId}
        isGuest={user?.isGuest}
        onRetry={retryConnection}
      />
    );
  }

  // Screen 2: Left Meeting Screen (Rejoin or Return to Dashboard)
  if (hasLeftMeeting) {
    return (
      <LeftMeetingScreen
        roomId={roomId}
        onRejoin={() => {
          setHasLeftMeeting(false);
          startCall();
        }}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 text-white flex flex-col font-sans">
      {/* WebRTC Audio Persistence Sink: guarantees remote microphone audio never cuts out when video toggles */}
      <AudioStreamManager
        remoteStreams={remoteStreams}
        remoteMediaStates={remoteMediaStates}
      />

      {/* 1. Dynamic Main Canvas View Modes */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {/* Mode 1: Meeting View (Full-Screen Video Conference Grid) */}
        {viewMode === "meeting" && (
          <WorkspaceMeetingGrid
            user={user}
            isJoinedCall={isJoinedCall}
            startCall={startCall}
            localStream={localStream}
            isCameraOff={isCameraOff}
            isMicMuted={isMicMuted}
            connectedUsers={connectedUsers}
            roomUsers={roomUsers}
            remoteStreams={remoteStreams}
            remoteMediaStates={remoteMediaStates}
          />
        )}

        {/* Mode 2: Whiteboard View (Collaborative Drawing Canvas - kept mounted so strokes persist) */}
        <div
          className="w-full h-full"
          style={{ display: viewMode === "whiteboard" ? "block" : "none" }}
        >
          <WorkspaceWhiteboard
            socket={socket}
            roomId={roomId}
            isVisible={viewMode === "whiteboard"}
          />
        </div>

        {/* Mode 3: Code Editor Workspace (Full VS Code Style Studio) */}
        <div
          className="w-full h-full"
          style={{ display: viewMode === "code" ? "block" : "none" }}
        >
          <CodeStudio
            socket={socket}
            roomId={roomId}
            user={user}
            roomName={roomName}
            roomHost={roomHost}
            files={files}
            setFiles={setFiles}
            activeFileIndex={activeFileIndex}
            setActiveFileIndex={setActiveFileIndex}
            onEndSession={handleEndSession}
            onLeaveRoom={() => setHasLeftMeeting(true)}
            editorTheme={editorTheme}
            editorFontSize={editorFontSize}
            editorMinimap={editorMinimap}
            editorWordWrap={editorWordWrap}
            editorTabSize={editorTabSize}
            editorLineNumbers={editorLineNumbers}
          />
        </div>

        {/* Slide-Over Drawer for Chat & Members across all workspace modes */}
        {sideDrawer !== "none" && (
          <div className="fixed top-0 right-0 bottom-16 w-80 sm:w-96 z-40 bg-neutral-950/95 backdrop-blur-xl border-l border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right-4 duration-200 font-mono">
            <div className="h-10 px-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  {sideDrawer === "chat" ? "Live Discussion" : "Room Participants"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSideDrawer("none")}
                className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-none transition-colors cursor-pointer"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel
                socket={socket}
                connectedUsers={connectedUsers}
                roomUsers={roomUsers}
                user={user}
              />
            </div>
          </div>
        )}

        {/* Persistent Resizable Video & Chat Sidebar on the Right (Visible in Code & Whiteboard modes) */}
        {viewMode !== "meeting" && (
          <WorkspaceVideoSidebar
            user={user}
            isJoinedCall={isJoinedCall}
            startCall={startCall}
            localStream={localStream}
            isCameraOff={isCameraOff}
            isMicMuted={isMicMuted}
            connectedUsers={connectedUsers}
            roomUsers={roomUsers}
            remoteStreams={remoteStreams}
            remoteMediaStates={remoteMediaStates}
            onExpandMeeting={() => setViewMode("meeting")}
            socket={socket}
          />
        )}
      </div>

      {/* Central Floating Control Bar */}
      <WorkspaceControlBar
        isJoinedCall={isJoinedCall}
        startCall={startCall}
        leaveCall={leaveCall}
        isMicMuted={isMicMuted}
        toggleMic={toggleMic}
        isCameraOff={isCameraOff}
        toggleCamera={toggleCamera}
        isScreenSharing={isScreenSharing}
        toggleScreenShare={toggleScreenShare}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sideDrawer={sideDrawer}
        setSideDrawer={setSideDrawer}
        unreadCount={unreadCount || 0}
        connectedUsersCount={1 + connectedUsers.length}
        onCopyInvite={handleCopyInviteLink}
        copiedInvite={copiedInviteLink}
        onDownloadCode={handleDownloadCode}
      />

      {/* Guest Join Flow Modal (No signup friction for meeting invitees) */}
      {isGuestModalOpen && (
        <GuestJoinModal
          roomId={roomId}
          roomInfo={publicRoomInfo}
          onJoinSuccess={handleGuestJoinSuccess}
          apiBaseUrl={API_BASE_URL}
        />
      )}
    </div>
  );
}
