"use client";

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

import styles from "./workspace.module.css";
import { API_BASE_URL, apiRequest } from "../../lib/api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/authSlice";
import ProfileDropdown from "../components/ProfileDropdown";
import Avatar from "@/components/Avatar";
import { useTheme } from "@/components/ThemeProvider";
import { setMessages, addMessage } from "@/redux/features/chatSlice";
import ChatPanel from "@/components/workspace/ChatPanel";
import LeftMeetingScreen from "../components/LeftMeetingScreen";

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const createDummyVideoTrack = () => {
  if (typeof window === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const stream = canvas.captureStream
    ? canvas.captureStream(1)
    : new MediaStream();
  return stream.getVideoTracks()[0] || null;
};

const createDummyAudioTrack = () => {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    oscillator.connect(dst);
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    if (track) {
      track.enabled = false;
    }
    return track || null;
  } catch (e) {
    return null;
  }
};

const attachTracksToPeerConnection = (pc, stream) => {
  if (!pc) return;
  const audioTrack = stream?.getAudioTracks()[0] || createDummyAudioTrack();
  const videoTrack = stream?.getVideoTracks()[0] || createDummyVideoTrack();

  const mediaStream = new MediaStream();

  // Always add Audio track first (m=audio index 0)
  if (audioTrack) {
    mediaStream.addTrack(audioTrack);
    try {
      pc.addTrack(audioTrack, mediaStream);
    } catch (e) {}
  }

  // Always add Video track second (m=video index 1)
  if (videoTrack) {
    mediaStream.addTrack(videoTrack);
    try {
      pc.addTrack(videoTrack, mediaStream);
    } catch (e) {}
  }
};

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
    console.error("Failed to play sound alert:", e);
  }
};

const getLanguageFromFilename = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "cpp":
    case "cc":
    case "cxx":
    case "h":
    case "hpp":
      return "cpp";
    case "c":
      return "c";
    case "java":
      return "java";
    case "rs":
      return "rust";
    case "go":
      return "go";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "sh":
    case "bash":
      return "shell";
    case "sql":
      return "sql";
    case "yaml":
    case "yml":
      return "yaml";
    default:
      return "plaintext";
  }
};

const getLanguageDisplayName = (monacoLang) => {
  const mapping = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    cpp: "C++",
    c: "C",
    java: "Java",
    rust: "Rust",
    go: "Go",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    markdown: "Markdown",
    shell: "Shell",
    sql: "SQL",
    yaml: "YAML",
    plaintext: "Plain Text",
  };
  return mapping[monacoLang] || monacoLang;
};

const renderFileIcon = (fileName) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const style = {
    fontSize: "9px",
    fontWeight: 800,
    padding: "1px 4px",
    borderRadius: "3px",
    fontFamily: "var(--font-mono), monospace",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "15px",
    flexShrink: 0,
    textTransform: "uppercase",
    letterSpacing: "-0.2px",
  };

  switch (ext) {
    case "ts":
    case "tsx":
      return (
        <span
          style={{ ...style, backgroundColor: "#007acc", color: "#ffffff" }}
        >
          TS
        </span>
      );
    case "js":
    case "jsx":
      return (
        <span
          style={{ ...style, backgroundColor: "#f7df1e", color: "#000000" }}
        >
          JS
        </span>
      );
    case "py":
      return (
        <span
          style={{ ...style, backgroundColor: "#3776ab", color: "#ffffff" }}
        >
          PY
        </span>
      );
    case "cpp":
    case "cc":
    case "cxx":
      return (
        <span
          style={{
            ...style,
            backgroundColor: "#00599c",
            color: "#ffffff",
            fontSize: "8px",
          }}
        >
          C++
        </span>
      );
    case "c":
      return (
        <span
          style={{ ...style, backgroundColor: "#659ad2", color: "#ffffff" }}
        >
          C
        </span>
      );
    case "java":
      return (
        <span
          style={{ ...style, backgroundColor: "#ea2d2e", color: "#ffffff" }}
        >
          JV
        </span>
      );
    case "rs":
      return (
        <span
          style={{
            ...style,
            backgroundColor: "#000000",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          RS
        </span>
      );
    case "go":
      return (
        <span
          style={{ ...style, backgroundColor: "#00add8", color: "#ffffff" }}
        >
          GO
        </span>
      );
    case "html":
    case "htm":
      return (
        <span
          style={{
            ...style,
            backgroundColor: "#e34c26",
            color: "#ffffff",
            fontSize: "8px",
          }}
        >
          HTML
        </span>
      );
    case "css":
      return (
        <span
          style={{ ...style, backgroundColor: "#264de4", color: "#ffffff" }}
        >
          CSS
        </span>
      );
    case "json":
      return (
        <span
          style={{ ...style, backgroundColor: "#cbcb41", color: "#000000" }}
        >{`{}`}</span>
      );
    case "md":
    case "markdown":
      return (
        <span
          style={{ ...style, backgroundColor: "#083fa1", color: "#ffffff" }}
        >
          MD
        </span>
      );
    case "sh":
    case "bash":
      return (
        <span
          style={{ ...style, backgroundColor: "#4ebd4e", color: "#ffffff" }}
        >
          SH
        </span>
      );
    case "sql":
      return (
        <span
          style={{ ...style, backgroundColor: "#e38c00", color: "#ffffff" }}
        >
          SQL
        </span>
      );
    default:
      return (
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "15px",
            color: "#aaa",
            width: "24px",
            textAlign: "center",
          }}
        >
          description
        </span>
      );
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
          Loading workspace...
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
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();

  // Compute resolved editor theme
  const isDarkTheme =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const editorTheme = isDarkTheme ? "vs-dark" : "vs";

  // States
  const [isMounted, setIsMounted] = useState(false);

  // Workspace/Editor Preference States
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorMinimap, setEditorMinimap] = useState(false);
  const [editorWordWrap, setEditorWordWrap] = useState("on");
  const [editorTabSize, setEditorTabSize] = useState(2);
  const [editorLineNumbers, setEditorLineNumbers] = useState("on");
  const [soundNotifications, setSoundNotifications] = useState(true);

  const [files, setFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [roomName, setRoomName] = useState("DevMeet Session");
  const [roomHost, setRoomHost] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [remoteMediaStates, setRemoteMediaStates] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(true);
  const [isOpenEditorsOpen, setIsOpenEditorsOpen] = useState(true);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  // Media States
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [isJoinedCall, setIsJoinedCall] = useState(false);

  // Resizer states
  const [collabWidth, setCollabWidth] = useState(320);
  const [isResizingWidth, setIsResizingWidth] = useState(false);

  // Refs
  const socketRef = useRef(null);
  const peerConnections = useRef({});
  const candidateQueue = useRef({});
  const localStreamRef = useRef(null);
  const isJoinedCallRef = useRef(false);
  const isCameraOffRef = useRef(true);
  const isMicMutedRef = useRef(true);
  const soundNotificationsRef = useRef(soundNotifications);
  const [hasLeftMeeting, setHasLeftMeeting] = useState(false);

  // Resizer drag event handlers
  const handleWidthResizeMouseDown = (e) => {
    e.preventDefault();
    setIsResizingWidth(true);
    const startX = e.clientX;
    const startWidth = collabWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    // Disable pointer events on editor canvas during resize to prevent iframe focus theft
    const editorCanvas = document.querySelector(`.${styles.codeCanvas}`);
    if (editorCanvas) {
      editorCanvas.style.pointerEvents = "none";
    }

    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.max(260, Math.min(600, startWidth + deltaX));
      setCollabWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (editorCanvas) {
        editorCanvas.style.pointerEvents = "";
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (editorCanvas) {
        editorCanvas.style.pointerEvents = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Lock body scroll on workspace page before first paint to prevent layout shift
  useLayoutEffect(() => {
    document.documentElement.classList.add("workspace-active");
    document.body.classList.add("workspace-active");
    return () => {
      document.documentElement.classList.remove("workspace-active");
      document.body.classList.remove("workspace-active");
    };
  }, []);

  // Ensure client mounting
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
      setCollabWidth(Math.round(window.innerWidth * 0.4));
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

      const muteJoin = localStorage.getItem("devmeet_call_mute_on_join");
      if (muteJoin) {
        const isMuted = muteJoin === "true";
        setIsMicMuted(isMuted);
        isMicMutedRef.current = isMuted;
      }

      const camJoin = localStorage.getItem("devmeet_call_camera_off_on_join");
      if (camJoin) {
        const isCamOff = camJoin === "true";
        setIsCameraOff(isCamOff);
        isCameraOffRef.current = isCamOff;
      }

      const sounds = localStorage.getItem("devmeet_notifications_sound");
      if (sounds) setSoundNotifications(sounds === "true");
    }
  }, []);

  // Keep isJoinedCallRef in sync
  useEffect(() => {
    isJoinedCallRef.current = isJoinedCall;
  }, [isJoinedCall]);

  useEffect(() => {
    isCameraOffRef.current = isCameraOff;
  }, [isCameraOff]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    soundNotificationsRef.current = soundNotifications;
  }, [soundNotifications]);

  // On mount, initialize localStream with dummy tracks
  useEffect(() => {
    if (!isMounted) return;
    const dummyVideo = createDummyVideoTrack();
    const dummyAudio = createDummyAudioTrack();
    const tracks = [];
    if (dummyVideo) tracks.push(dummyVideo);
    if (dummyAudio) tracks.push(dummyAudio);
    if (tracks.length > 0) {
      const stream = new MediaStream(tracks);
      setLocalStream(stream);
      localStreamRef.current = stream;
    }
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isMounted]);

  // Fetch current user if state is empty (e.g. on direct page refresh)
  useEffect(() => {
    if (!isMounted) return;

    const fetchUser = async () => {
      try {
        const response = await apiRequest("/api/v1/users/current-user");
        if (response?.data) {
          dispatch(
            setCredentials({
              user: response.data,
              token: response.data.accessToken,
            }),
          );
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (err?.message?.includes("Session expired") || err?.message?.includes("unauthorized") || err?.message?.includes("Unauthorized")) {
          router.push("/login");
        }
      }
    };

    if (!user) {
      fetchUser();
    }
  }, [user, dispatch, router, isMounted]);

  // Fetch Room Info
  useEffect(() => {
    if (!isMounted || !roomId) return;

    const fetchRoom = async () => {
      try {
        const response = await apiRequest(`/api/v1/rooms/${roomId}`);
        if (response?.data) {
          setRoomName(response.data.roomName);
          setRoomHost(response.data.host);
          let roomFiles = response.data.files || [];
          if (roomFiles.length === 0) {
            const lang = response.data.primaryLanguage || "TypeScript";
            const ext = lang.toLowerCase() === "python" ? "py" : "ts";
            roomFiles = [
              {
                name: `main.${ext}`,
                content:
                  response.data.code ||
                  "// Welcome to DevMeet Workspace. Collaborators will sync in real time.\n",
                language: lang,
              },
            ];
          }
          setFiles(roomFiles);
          setActiveFileIndex(0);
        }
      } catch (err) {
        console.error("Failed to fetch room info:", err);
      }
    };

    fetchRoom();
  }, [roomId, isMounted]);

  // Initialize Socket.IO & Code Collaboration & Call Listeners
  useEffect(() => {
    if (!isMounted || !user || !roomId) return;
    // 1. Setup Socket.IO connection
    const socket = io(API_BASE_URL, {
      withCredentials: true,
      auth: { token },
    });
    socketRef.current = socket;

    // 2. Emit Join Room on connect/reconnect
    socket.on("connect", () => {
      socket.emit("join-room", { roomId });
    });

    // 3. Handle Socket Events
    socket.on(
      "room-state",
      async ({
        code: existingCode,
        language: roomLang,
        files: roomFiles,
        messages: existingMessages,
        users: roomUsersList,
      }) => {
        // Don't auto-override if we already have local changes
        if (!files.length && roomFiles && roomFiles.length > 0) {
          setFiles(roomFiles);
        } else if (!files.length && existingCode) {
          setFiles([
            {
              name: `main.${roomLang === "python" ? "py" : "ts"}`,
              content: existingCode,
              language: roomLang || "TypeScript",
            },
          ]);
        }
        if (existingMessages) {
          dispatch(setMessages(existingMessages));
        }

        if (roomUsersList) {
          const filtered = roomUsersList.filter(
            (u) => u.socketId !== socketRef.current?.id,
          );
          setConnectedUsers(filtered);
        }

        // Auto-rejoin call if user was in a call before refreshing
        if (typeof window !== "undefined" && roomId) {
          const wasInCall = sessionStorage.getItem(`devmeet_in_call_${roomId}`);
          if (wasInCall === "true" && !isJoinedCallRef.current) {
            setTimeout(() => {
              startCall();
            }, 300);
          }
        }
      },
    );

    socket.on("room-error", ({ message }) => {
      alert(message);
      router.push("/dashboard");
    });

    socket.on("session-ended", ({ message }) => {
      alert(message);
      router.push("/dashboard");
    });

    socket.on("user-joined", ({ socketId, user: joinedUser }) => {
      console.log("User joined room:", joinedUser.username);
      if (soundNotificationsRef.current) {
        playNotificationSound(true);
      }
      setConnectedUsers((prev) => {
        const filtered = prev.filter((u) => u.socketId !== socketId);
        return [...filtered, { socketId, user: joinedUser }];
      });
      dispatch(
        addMessage({
          type: "system",
          text: `${joinedUser?.fullName || joinedUser?.username || "A user"} joined the room`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }),
      );
    });

    socket.on(
      "files-update",
      ({ files: updatedFiles, activeFileIndex: updatedIndex }) => {
        if (updatedFiles) {
          setFiles(updatedFiles);
        }
        if (updatedIndex !== undefined) {
          setActiveFileIndex(updatedIndex);
        }
      },
    );

    socket.on("call-state", ({ users }) => {
      // Deduplicate users by user._id so refreshed sockets don't produce duplicate video cards
      const userMap = new Map();
      (users || []).forEach((item) => {
        if (item.socketId === socketRef.current?.id) return;
        const key = item.user?._id ? String(item.user._id) : item.socketId;
        userMap.set(key, item);
      });
      const filtered = Array.from(userMap.values());
      setRoomUsers(filtered);

      // Initiate WebRTC connection to each unique user actively in the call
      filtered.forEach(async (peer) => {
        const targetSocketId = peer.socketId;
        if (peerConnections.current[targetSocketId]) {
          peerConnections.current[targetSocketId].close();
          delete peerConnections.current[targetSocketId];
        }
        const pc = new RTCPeerConnection(rtcConfig);
        peerConnections.current[targetSocketId] = pc;
        // Add local tracks deterministically (audio m-line 0, video m-line 1)
        attachTracksToPeerConnection(pc, localStreamRef.current);
        // Handle Ice Candidate
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc-signal", {
              targetSocketId,
              signal: { type: "candidate", candidate: event.candidate },
            });
          }
        };
        // Handle Remote Track
        pc.ontrack = (event) => {
          const remoteStream =
            event.streams[0] || new MediaStream([event.track]);
          setRemoteStreams((prev) => ({
            ...prev,
            [targetSocketId]: remoteStream,
          }));
        };
        // Create offer
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-signal", {
            targetSocketId,
            signal: { type: "offer", offer },
          });
          // Send media state to the peer
          socket.emit("webrtc-signal", {
            targetSocketId,
            signal: {
              type: "media-state",
              isCameraOff: isCameraOffRef.current,
              isMicMuted: isMicMutedRef.current,
            },
          });
        } catch (err) {
          console.error("Error creating offer:", err);
        }
      });
    });

    socket.on("user-joined-call", async ({ socketId, user: joinedUser, mediaState }) => {
      console.log("User joined call:", joinedUser?.username || socketId);
      
      setRoomUsers((prev) => {
        // Find and clean up any old socket connection for the same user _id
        const userKey = joinedUser?._id ? String(joinedUser._id) : null;
        const staleItems = prev.filter(
          (u) =>
            u.socketId === socketId ||
            (userKey && u.user?._id && String(u.user._id) === userKey)
        );

        staleItems.forEach((stale) => {
          if (peerConnections.current[stale.socketId]) {
            peerConnections.current[stale.socketId].close();
            delete peerConnections.current[stale.socketId];
          }
          setRemoteStreams((streams) => {
            const next = { ...streams };
            delete next[stale.socketId];
            return next;
          });
        });

        const filtered = prev.filter(
          (u) =>
            u.socketId !== socketId &&
            (!userKey || !u.user?._id || String(u.user._id) !== userKey)
        );
        return [...filtered, { socketId, user: joinedUser }];
      });

      if (mediaState) {
        setRemoteMediaStates((prev) => ({
          ...prev,
          [socketId]: mediaState,
        }));
      }

      // If we are currently in the call, initiate a fresh WebRTC connection to the joined peer
      if (isJoinedCallRef.current) {
        const pc = new RTCPeerConnection(rtcConfig);
        peerConnections.current[socketId] = pc;
        attachTracksToPeerConnection(pc, localStreamRef.current);

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc-signal", {
              targetSocketId: socketId,
              signal: { type: "candidate", candidate: event.candidate },
            });
          }
        };

        pc.ontrack = (event) => {
          const remoteStream =
            event.streams[0] || new MediaStream([event.track]);
          setRemoteStreams((prev) => ({
            ...prev,
            [socketId]: remoteStream,
          }));
        };

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-signal", {
            targetSocketId: socketId,
            signal: { type: "offer", offer },
          });
          socket.emit("webrtc-signal", {
            targetSocketId: socketId,
            signal: {
              type: "media-state",
              isCameraOff: isCameraOffRef.current,
              isMicMuted: isMicMutedRef.current,
            },
          });
        } catch (err) {
          console.error("Error creating offer for joined peer:", err);
        }
      }
    });

    socket.on("user-left-call", ({ socketId }) => {
      console.log("User left call:", socketId);
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
      setRoomUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    });

    socket.on("peer-media-toggled", ({ socketId, isMicMuted, isCameraOff }) => {
      setRemoteMediaStates((prev) => ({
        ...prev,
        [socketId]: { isMicMuted, isCameraOff },
      }));
    });

    socket.on("webrtc-signal", async ({ senderSocketId, signal }) => {
      if (!isJoinedCallRef.current) return; // Ignore signals if we are not in call
      if (signal.type === "media-state") {
        setRemoteMediaStates((prev) => ({
          ...prev,
          [senderSocketId]: {
            isCameraOff: signal.isCameraOff,
            isMicMuted: signal.isMicMuted,
          },
        }));
        return;
      }

      let pc = peerConnections.current[senderSocketId];

      if (signal.type === "offer") {
        if (!pc) {
          pc = new RTCPeerConnection(rtcConfig);
          peerConnections.current[senderSocketId] = pc;

          // Add local tracks deterministically (audio m-line 0, video m-line 1)
          attachTracksToPeerConnection(pc, localStreamRef.current);

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("webrtc-signal", {
                targetSocketId: senderSocketId,
                signal: { type: "candidate", candidate: event.candidate },
              });
            }
          };

          pc.ontrack = (event) => {
            const remoteStream =
              event.streams[0] || new MediaStream([event.track]);
            setRemoteStreams((prev) => ({
              ...prev,
              [senderSocketId]: remoteStream,
            }));
          };
        }

        try {
          if (signal.offer) {
            await pc.setRemoteDescription(
              new RTCSessionDescription(signal.offer),
            );
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("webrtc-signal", {
              targetSocketId: senderSocketId,
              signal: { type: "answer", answer },
            });
            // Send our media state to the peer
            socket.emit("webrtc-signal", {
              targetSocketId: senderSocketId,
              signal: {
                type: "media-state",
                isCameraOff: isCameraOffRef.current,
                isMicMuted: isMicMutedRef.current,
              },
            });
          }

          // Process queued candidates
          const queued = candidateQueue.current[senderSocketId];
          if (queued) {
            for (const cand of queued) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {
                console.error("Error adding queued candidate:", e);
              }
            }
            delete candidateQueue.current[senderSocketId];
          }
        } catch (err) {
          console.error("Error handling offer:", err);
        }
      } else if (signal.type === "answer") {
        if (pc) {
          try {
            if (signal.answer) {
              await pc.setRemoteDescription(
                new RTCSessionDescription(signal.answer),
              );
            }
            // Process queued candidates
            const queued = candidateQueue.current[senderSocketId];
            if (queued) {
              for (const cand of queued) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {
                  console.error("Error adding queued candidate:", e);
                }
              }
              delete candidateQueue.current[senderSocketId];
            }
          } catch (err) {
            console.error("Error setting remote description:", err);
          }
        }
      } else if (signal.type === "candidate") {
        if (pc && pc.remoteDescription && signal.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (err) {
            console.error("Error adding ICE candidate:", err);
          }
        } else if (signal.candidate) {
          if (!candidateQueue.current[senderSocketId]) {
            candidateQueue.current[senderSocketId] = [];
          }
          candidateQueue.current[senderSocketId].push(signal.candidate);
        }
      }
    });

    socket.on("user-disconnected", ({ socketId, user: leftUser }) => {
      console.log("User disconnected:", socketId);
      if (soundNotificationsRef.current) {
        playNotificationSound(false);
      }
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
      setRoomUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      setConnectedUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      if (leftUser) {
        dispatch(
          addMessage({
            type: "system",
            text: `${leftUser?.fullName || leftUser?.username || "A user"} left the room`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }),
        );
      }
    });

    // Cleanup on unmount
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.keys(peerConnections.current).forEach((id) => {
        peerConnections.current[id].close();
      });
      peerConnections.current = {};
    };
  }, [isMounted, user, token, roomId]);

  // Code change emission
  const handleEditorChange = (value) => {
    if (value === undefined) return;
    const activeFile = files[activeFileIndex];
    if (!activeFile) return;

    // Direct content-comparison check to prevent cycles
    if (value === activeFile.content) {
      return;
    }

    const updated = files.map((file, idx) => {
      if (idx === activeFileIndex) {
        return { ...file, content: value };
      }
      return file;
    });
    setFiles(updated);
    if (socketRef.current) {
      socketRef.current.emit("files-change", {
        files: updated,
        activeFileIndex,
      });
    }
  };

  const handleTabSelect = (index) => {
    setActiveFileIndex(index);
    if (socketRef.current) {
      socketRef.current.emit("files-change", { files, activeFileIndex: index });
    }
  };

  const handleCreateFile = (fileName) => {
    if (!fileName.trim()) return;
    if (
      files.some((f) => f.name.toLowerCase() === fileName.trim().toLowerCase())
    ) {
      alert("File already exists!");
      return;
    }

    const detectedLang = getLanguageDisplayName(
      getLanguageFromFilename(fileName.trim()),
    );

    const newFile = {
      name: fileName.trim(),
      content: "",
      language: detectedLang,
    };

    const updatedFiles = [...files, newFile];
    const newIndex = updatedFiles.length - 1;

    setFiles(updatedFiles);
    setActiveFileIndex(newIndex);
    setIsCreatingFile(false);
    setNewFileName("");

    if (socketRef.current) {
      socketRef.current.emit("files-change", {
        files: updatedFiles,
        activeFileIndex: newIndex,
      });
    }
  };

  const handleDeleteFile = (e, index) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert("Cannot delete the only remaining file!");
      return;
    }

    const updatedFiles = files.filter((_, idx) => idx !== index);
    let newIndex = activeFileIndex;
    if (activeFileIndex >= updatedFiles.length) {
      newIndex = updatedFiles.length - 1;
    } else if (activeFileIndex === index) {
      newIndex = Math.max(0, index - 1);
    } else if (activeFileIndex > index) {
      newIndex = activeFileIndex - 1;
    }

    setFiles(updatedFiles);
    setActiveFileIndex(newIndex);

    if (socketRef.current) {
      socketRef.current.emit("files-change", {
        files: updatedFiles,
        activeFileIndex: newIndex,
      });
    }
  };

  const handleLanguageChange = (newLang) => {
    if (files.length === 0) return;

    const activeFile = files[activeFileIndex];
    if (!activeFile) return;

    let ext = "ts";
    const langLower = newLang.toLowerCase();
    if (langLower === "python") ext = "py";
    else if (langLower === "javascript") ext = "js";
    else if (langLower === "typescript") ext = "ts";
    else if (langLower === "rust") ext = "rs";
    else if (langLower === "go") ext = "go";
    else if (langLower === "c++" || langLower === "cpp") ext = "cpp";
    else if (langLower === "c") ext = "c";
    else if (langLower === "java") ext = "java";
    else if (langLower === "html") ext = "html";
    else if (langLower === "css") ext = "css";
    else if (langLower === "json") ext = "json";
    else if (langLower === "markdown" || langLower === "md") ext = "md";
    else if (langLower === "shell" || langLower === "sh") ext = "sh";
    else if (langLower === "sql") ext = "sql";
    else if (langLower === "yaml" || langLower === "yml") ext = "yaml";

    const nameParts = activeFile.name.split(".");
    if (nameParts.length > 1) {
      nameParts[nameParts.length - 1] = ext;
    } else {
      nameParts.push(ext);
    }
    const newName = nameParts.join(".");

    const updatedFiles = files.map((file, idx) => {
      if (idx === activeFileIndex) {
        return {
          ...file,
          name: newName,
          language: newLang,
        };
      }
      return file;
    });

    setFiles(updatedFiles);

    if (socketRef.current) {
      socketRef.current.emit("files-change", {
        files: updatedFiles,
        activeFileIndex,
      });
    }
  };

  const broadcastMediaState = (cameraOff, micMuted) => {
    if (socketRef.current) {
      socketRef.current.emit("toggle-media", {
        isCameraOff: cameraOff,
        isMicMuted: micMuted,
      });
    }
    Object.keys(peerConnections.current).forEach((socketId) => {
      if (socketRef.current) {
        socketRef.current.emit("webrtc-signal", {
          targetSocketId: socketId,
          signal: {
            type: "media-state",
            isCameraOff: cameraOff,
            isMicMuted: micMuted,
          },
        });
      }
    });
  };

  const acquireLocalStream = async (requestVideo, requestAudio) => {
    try {
      // Release any existing local stream tracks first to prevent driver lock conflicts
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: requestVideo,
          audio: requestAudio
            ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : false,
        });
      } catch (e) {
        console.warn(`Media acquisition error [${e?.name || "Error"}]: ${e?.message || e}`);

        // If OS camera driver is in transition or locked by pre-join lobby, wait 200ms and retry
        if (e.name === "NotReadableError" || e.name === "OverconstrainedError") {
          await new Promise((res) => setTimeout(res, 200));
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: requestVideo,
              audio: requestAudio
                ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                  }
                : false,
            });
          } catch (retryErr) {
            console.warn("Retry failed, attempting fallback modes");
          }
        }

        // Fallback if camera is missing/locked but they have a mic
        if (!stream && requestVideo && requestAudio) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
            });
            requestVideo = false;
            console.warn("Camera not available or locked, falling back to audio only");
          } catch (e2) {
            // Fallback to video only if mic is missing
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
              });
              requestAudio = false;
              console.warn("Mic not found, falling back to video only");
            } catch (e3) {
              throw e;
            }
          }
        } else if (!stream) {
          throw e;
        }
      }
      if (!stream) throw new Error("Could not acquire stream");

      setLocalStream(stream);
      localStreamRef.current = stream;

      // Update state track indicators
      setIsCameraOff(!requestVideo);
      setIsMicMuted(!requestAudio);

      // Disable tracks if they are supposed to start disabled
      if (!requestVideo) {
        stream.getVideoTracks().forEach((t) => (t.enabled = false));
      }
      if (!requestAudio) {
        stream.getAudioTracks().forEach((t) => (t.enabled = false));
      }

      // Add tracks to all active RTCPeerConnections
      Object.keys(peerConnections.current).forEach(async (socketId) => {
        const pc = peerConnections.current[socketId];
        attachTracksToPeerConnection(pc, stream);

        // Renegotiate: create new offer and send to remote peer
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (socketRef.current) {
            socketRef.current.emit("webrtc-signal", {
              targetSocketId: socketId,
              signal: { type: "offer", offer },
            });
          }
        } catch (negotiateErr) {
          console.error("Error renegotiating track addition:", negotiateErr);
        }
      });

      // Broadcast state to all peers
      broadcastMediaState(!requestVideo, !requestAudio);
    } catch (err) {
      console.error("Failed to access camera/microphone:", err);
      alert(
        "Could not access camera or microphone. Please check permissions and try again.",
      );
    }
  };

  // Start Video Call
  const startCall = async () => {
    // Check if user selected Code & Chat Only mode (No VC)
    if (typeof window !== "undefined") {
      const isNoVcPref = sessionStorage.getItem(`devmeet_no_vc_${roomId}`) === "true";
      if (isNoVcPref) {
        console.log("User selected Code & Chat Only mode (No VC).");
        return;
      }

      // Check pre-join lobby mic/cam preferences
      const micPref = sessionStorage.getItem(`devmeet_mic_pref_${roomId}`);
      const camPref = sessionStorage.getItem(`devmeet_cam_pref_${roomId}`);
      if (micPref === "false") {
        setIsMicMuted(true);
        isMicMutedRef.current = true;
      }
      if (camPref === "false") {
        setIsCameraOff(true);
        isCameraOffRef.current = true;
      }
    }

    // Acquire both video and audio tracks from getUserMedia
    await acquireLocalStream(true, true);
    // Apply initial mute/camera preferences
    if (localStreamRef.current) {
      if (isMicMutedRef.current) {
        localStreamRef.current
          .getAudioTracks()
          .forEach((t) => (t.enabled = false));
      }
      if (isCameraOffRef.current) {
        localStreamRef.current
          .getVideoTracks()
          .forEach((t) => (t.enabled = false));
      }
    }
    // Sync states with ref indicators
    isMicMutedRef.current = isMicMuted;
    isCameraOffRef.current = isCameraOff;

    setIsJoinedCall(true);
    isJoinedCallRef.current = true;
    if (typeof window !== "undefined" && roomId) {
      sessionStorage.setItem(`devmeet_in_call_${roomId}`, "true");
    }
    if (socketRef.current) {
      socketRef.current.emit("join-call");
    }
    // Broadcast initial camera/microphone state to peers
    broadcastMediaState(isCameraOff, isMicMuted);
  };

  // Leave Video Call
  const leaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    localStreamRef.current = null;
    setIsJoinedCall(false);
    isJoinedCallRef.current = false;

    if (typeof window !== "undefined" && roomId) {
      sessionStorage.removeItem(`devmeet_in_call_${roomId}`);
    }

    if (socketRef.current) {
      socketRef.current.emit("leave-call");
    }

    Object.keys(peerConnections.current).forEach((id) => {
      peerConnections.current[id].close();
      delete peerConnections.current[id];
    });

    setRemoteStreams({});
    setRoomUsers([]);
    setIsMicMuted(true);
    setIsCameraOff(true);
  };

  // Toggle Mic
  const toggleMic = async () => {
    if (localStream) {
      const nextMuted = !isMicMuted;
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
      setIsMicMuted(nextMuted);
      broadcastMediaState(isCameraOff, nextMuted);
    } else {
      await acquireLocalStream(!isCameraOff, true);
    }
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (localStream) {
      const nextCameraOff = !isCameraOff;
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !nextCameraOff;
      });
      setIsCameraOff(nextCameraOff);
      broadcastMediaState(nextCameraOff, isMicMuted);
    } else {
      await acquireLocalStream(true, !isMicMuted);
    }
  };

  // Code runner
  const handleRunCode = async () => {
    const activeFile = files[activeFileIndex];
    if (!activeFile) return;

    setIsRunningCode(true);
    setIsConsoleOpen(true);
    setConsoleOutput({
      stdout: "Running code on local sandbox server...",
      stderr: "",
    });
    try {
      const response = await apiRequest("/api/v1/rooms/run", {
        method: "POST",
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language,
        }),
      });
      const output = response?.data;
      if (output) {
        setConsoleOutput({
          stdout: output.stdout || "",
          stderr: output.stderr || "",
          error:
            output.exitCode !== 0
              ? `Process exited with code ${output.exitCode}`
              : undefined,
        });
      } else {
        setConsoleOutput({
          stdout: "",
          stderr: "Failed to execute code: invalid response format",
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setConsoleOutput({
        stdout: "",
        stderr: "",
        error: `Execution Error: ${errorMsg}`,
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleEndSession = async () => {
    try {
      await apiRequest(`/api/v1/rooms/${roomId}/end`, { method: "POST" });
      if (socketRef.current) {
        socketRef.current.emit("end-session-broadcast", { roomId });
      }
    } catch (err) {
      console.warn("End session notice:", err);
    }
    setHasLeftMeeting(true);
  };

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
    <div className={styles.layout}>
      {/* Activity Bar (VS Code style narrow leftmost navigation) */}
      <div className={styles.activityBar}>
        <div className={styles.activityBarTop}>
          <button
            className={`${styles.activityBtn} ${!isSidebarCollapsed ? styles.activityBtnActive : ""}`}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Explorer"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M19 5.5H12l-2-2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2zm0 13H5v-11h14v11z" />
            </svg>
          </button>
          <button
            className={styles.activityBtn}
            title="Search (Coming Soon)"
            disabled
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
          <button
            className={styles.activityBtn}
            title="Source Control (Coming Soon)"
            disabled
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M18.5 11.5c-1.38 0-2.5 1.12-2.5 2.5 0 .96.54 1.8 1.34 2.22l-3.34 3.34c-.26-.14-.54-.26-.84-.34V6.28c.8-.42 1.34-1.26 1.34-2.28 0-1.38-1.12-2.5-2.5-2.5S10 2.62 10 4c0 1.02.54 1.86 1.34 2.28v11.44c-.8.42-1.34 1.26-1.34 2.28 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-.96-.54-1.8-1.34-2.22l3.34-3.34c.26.14.54.26.84.34v.04c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm-6-8c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 17c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6-6c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
            </svg>
          </button>
        </div>

        <div className={styles.activityBarBottom}>
          {user?._id === roomHost && (
            <button
              className={styles.activityBtn}
              onClick={handleEndSession}
              title="End Session"
              style={{ color: "#ef4444" }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
              </svg>
            </button>
          )}
          <button
            className={styles.activityBtn}
            onClick={() => setHasLeftMeeting(true)}
            title="Leave Room"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
            </svg>
          </button>
          <button
            className={styles.activityBtn}
            onClick={() => router.push("/dashboard/settings")}
            title="Settings"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>
          <div className={styles.activityProfile}>
            <ProfileDropdown />
          </div>
        </div>
      </div>

      {/* Collapsible File Explorer Sidebar */}
      <aside
        className={`${styles.explorerSidebar} ${isSidebarCollapsed ? styles.explorerSidebarHidden : ""}`}
      >
        <div className={styles.explorerHeader}>
          <span className={styles.explorerTitle}>Explorer</span>
          <button className={styles.sectionActionBtn} title="More Actions...">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              more_horiz
            </span>
          </button>
        </div>

        <div className={styles.explorerSections}>
          {/* Scrollable upper sections (Open Editors & Workspace Files) */}
          <div className={styles.scrollableSections}>
            {/* SECTION 1: OPEN EDITORS */}
            <div className={styles.sectionContainer}>
              <div
                className={styles.sectionHeader}
                onClick={() => setIsOpenEditorsOpen(!isOpenEditorsOpen)}
              >
                <div className={styles.sectionHeaderLeft}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    {isOpenEditorsOpen
                      ? "keyboard_arrow_down"
                      : "keyboard_arrow_right"}
                  </span>
                  <span className={styles.sectionTitle}>Open Editors</span>
                </div>
              </div>

              {isOpenEditorsOpen && (
                <div className={styles.sectionContent}>
                  <ul className={styles.openEditorsList}>
                    {files.map((file, idx) => {
                      const isActive = idx === activeFileIndex;
                      if (!isActive) return null;
                      return (
                        <li
                          key={idx}
                          className={`${styles.openEditorItem} ${styles.openEditorItemActive}`}
                          onClick={() => handleTabSelect(idx)}
                        >
                          <div className={styles.fileItemLeft}>
                            {renderFileIcon(file.name)}
                            <span className={styles.explorerFileName}>
                              {file.name}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* SECTION 2: WORKSPACE FILES */}
            <div className={styles.sectionContainer}>
              <div
                className={styles.sectionHeader}
                onClick={() => setIsFolderOpen(!isFolderOpen)}
              >
                <div className={styles.sectionHeaderLeft}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    {isFolderOpen
                      ? "keyboard_arrow_down"
                      : "keyboard_arrow_right"}
                  </span>
                  <span className={styles.sectionTitle}>{roomName}</span>
                </div>

                <div className={styles.sectionActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreatingFile(true);
                    }}
                    className={styles.sectionActionBtn}
                    title="New File..."
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "15px" }}
                    >
                      note_add
                    </span>
                  </button>
                </div>
              </div>

              {isFolderOpen && (
                <div className={styles.sectionContent}>
                  {isCreatingFile && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateFile(newFileName);
                      }}
                      className={styles.explorerCreateForm}
                    >
                      <input
                        autoFocus
                        type="text"
                        placeholder="filename.ts..."
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className={styles.explorerCreateInput}
                        onBlur={() => {
                          if (!newFileName.trim()) {
                            setIsCreatingFile(false);
                          }
                        }}
                      />
                    </form>
                  )}

                  <ul className={styles.explorerFileList}>
                    {files.map((file, idx) => {
                      const isActive = idx === activeFileIndex;
                      return (
                        <li
                          key={idx}
                          className={`${styles.explorerFileItem} ${isActive ? styles.explorerFileItemActive : ""}`}
                          onClick={() => handleTabSelect(idx)}
                        >
                          <div className={styles.fileItemLeft}>
                            {renderFileIcon(file.name)}
                            <span className={styles.explorerFileName}>
                              {file.name}
                            </span>
                          </div>
                          {files.length > 1 && (
                            <button
                              className={styles.explorerFileDeleteBtn}
                              onClick={(e) => handleDeleteFile(e, idx)}
                              title="Delete File"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "13px" }}
                              >
                                close
                              </span>
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Fixed bottom sections (Outline & Timeline) */}
          <div className={styles.fixedSections}>
            {/* SECTION 3: OUTLINE */}
            <div className={styles.sectionContainer}>
              <div
                className={styles.sectionHeader}
                onClick={() => setIsOutlineOpen(!isOutlineOpen)}
              >
                <div className={styles.sectionHeaderLeft}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    {isOutlineOpen
                      ? "keyboard_arrow_down"
                      : "keyboard_arrow_right"}
                  </span>
                  <span className={styles.sectionTitle}>Outline</span>
                </div>
              </div>

              {isOutlineOpen && (
                <div className={styles.sectionContent}>
                  <div className={styles.emptyPlaceholderText}>
                    No outline symbols found.
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: TIMELINE */}
            <div className={styles.sectionContainer}>
              <div
                className={styles.sectionHeader}
                onClick={() => setIsTimelineOpen(!isTimelineOpen)}
              >
                <div className={styles.sectionHeaderLeft}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    {isTimelineOpen
                      ? "keyboard_arrow_down"
                      : "keyboard_arrow_right"}
                  </span>
                  <span className={styles.sectionTitle}>Timeline</span>
                </div>
              </div>

              {isTimelineOpen && (
                <div className={styles.sectionContent}>
                  <div className={styles.emptyPlaceholderText}>
                    No timeline information.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Canvas Container */}
      <main className={styles.mainCanvasContainer}>
        {/* Editor & Video Panel Split */}
        <div className={styles.workspaceSplit}>
          {/* Code Editor Section */}
          <section className={styles.editorPanelOverrode}>
            <div className={styles.codeCanvas}>
              {/* Tab Bar */}
              <div className={styles.tabBar}>
                <div className={styles.tabsContainer}>
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className={
                        idx === activeFileIndex ? styles.tabActive : styles.tab
                      }
                      onClick={() => handleTabSelect(idx)}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "0.875rem" }}
                      >
                        description
                      </span>
                      <span>{file.name}</span>
                      {files.length > 1 && (
                        <span
                          className={`material-symbols-outlined ${styles.tabCloseBtn}`}
                          onClick={(e) => handleDeleteFile(e, idx)}
                        >
                          close
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tab Bar Actions */}
                <div className={styles.tabBarActions}>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className={styles.tabBarRunBtn}
                    title="Run Code"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      {isRunningCode ? "hourglass_empty" : "play_arrow"}
                    </span>
                  </button>
                  <select
                    value={files[activeFileIndex]?.language || "TypeScript"}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className={styles.languageSelect}
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="C">C</option>
                    <option value="Java">Java</option>
                    <option value="Rust">Rust</option>
                    <option value="Go">Go</option>
                    <option value="HTML">HTML</option>
                    <option value="CSS">CSS</option>
                    <option value="JSON">JSON</option>
                    <option value="Markdown">Markdown</option>
                    <option value="Shell">Shell</option>
                    <option value="SQL">SQL</option>
                    <option value="YAML">YAML</option>
                  </select>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                <Editor
                  height="100%"
                  language={
                    files[activeFileIndex]
                      ? getLanguageFromFilename(files[activeFileIndex].name)
                      : "typescript"
                  }
                  theme="vs-dark"
                  value={files[activeFileIndex]?.content || ""}
                  onChange={handleEditorChange}
                  options={{
                    fontSize: editorFontSize,
                    minimap: { enabled: editorMinimap },
                    wordWrap: editorWordWrap,
                    tabSize: editorTabSize,
                    lineNumbers: editorLineNumbers,
                    automaticLayout: true,
                    fontFamily: "var(--font-mono), monospace",
                    cursorBlinking: "smooth",
                    padding: { top: 16 },
                  }}
                />
              </div>

              {/* Collapsible Console Output drawer */}
              {isConsoleOpen && (
                <div className={styles.consoleDrawer}>
                  <div className={styles.consoleHeader}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span className={styles.consoleTitle}>
                        CONSOLE OUTPUT
                      </span>
                    </div>
                    <button
                      onClick={() => setIsConsoleOpen(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1.05rem" }}
                      >
                        close
                      </span>
                    </button>
                  </div>
                  <div className={styles.consoleOutputArea}>
                    {!consoleOutput &&
                      "No execution output yet. Click the Play icon on the tab bar to run your code."}
                    {consoleOutput && (
                      <>
                        {consoleOutput.stdout && (
                          <div style={{ color: "#a3efff" }}>
                            {consoleOutput.stdout}
                          </div>
                        )}
                        {consoleOutput.stderr && (
                          <div
                            style={{ color: "#ff7b72", marginTop: "0.25rem" }}
                          >
                            {consoleOutput.stderr}
                          </div>
                        )}
                        {consoleOutput.error && (
                          <div
                            style={{
                              color: "#ff7b72",
                              fontWeight: "bold",
                              marginTop: "0.25rem",
                            }}
                          >
                            {consoleOutput.error}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.statusBar}>
                <div className={styles.statusLeft}>
                  <span className={styles.statusDot}></span>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                  >
                    {isConsoleOpen ? "Hide Console" : "Show Console"}
                  </span>
                  <span>Connected</span>
                  <span>
                    {files[activeFileIndex]?.language || "TypeScript"}
                  </span>
                </div>
                <div className={styles.statusRight}>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className={styles.statusRunBtn}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "0.875rem", marginRight: "0.25rem" }}
                    >
                      play_arrow
                    </span>
                    {isRunningCode ? "Running..." : "Run Code"}
                  </button>
                  <span>UTF-8</span>
                  <span>Room: {roomId}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Width Resizer Handle */}
          <div
            className={styles.widthResizer}
            onMouseDown={handleWidthResizeMouseDown}
          />

          {/* Video & Chat Collaborative Panel */}
          <aside
            className={styles.collabPanel}
            style={{ width: `${collabWidth}px` }}
          >
            {/* Video Feeds Section */}
            <div
              className={styles.videoGrid}
              style={{
                height: `100%`,
                maxHeight: `100%`,
              }}
            >
              {/* Local Stream */}
              <div
                className={`${styles.videoBox} ${styles.videoBoxLocal}`}
                style={{
                  border: isJoinedCall
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px dashed rgba(255,255,255,0.2)",
                }}
              >
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
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <div
                      style={{
                        border: isJoinedCall
                          ? "2px solid #4ade80"
                          : "2px dashed rgba(255,255,255,0.3)",
                        borderRadius: "50%",
                      }}
                    >
                      <Avatar
                        src={user?.avatar || user?.avatarUrl || null}
                        name={user?.fullName || user?.username || "You"}
                        size={48}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.625rem",
                        color: "rgba(255, 255, 255, 0.45)",
                        marginTop: "0.25rem",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {isJoinedCall ? "Camera Off" : "Not in Call"}
                    </span>
                    {!isJoinedCall && (
                      <button
                        onClick={startCall}
                        style={{
                          marginTop: "0.5rem",
                          backgroundColor: "#007acc",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.625rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontFamily: "var(--font-space-grotesk)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "0.75rem" }}
                        >
                          videocam
                        </span>
                        Join Call
                      </button>
                    )}
                  </div>
                )}
                {isJoinedCall && (
                  <div className={styles.videoControls}>
                    <button
                      onClick={toggleMic}
                      className={`${styles.controlBtn} ${isMicMuted ? styles.controlBtnActive : ""}`}
                      title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1.05rem" }}
                      >
                        {isMicMuted ? "mic_off" : "mic"}
                      </span>
                    </button>
                    <button
                      onClick={toggleCamera}
                      className={`${styles.controlBtn} ${isCameraOff ? styles.controlBtnActive : ""}`}
                      title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1.05rem" }}
                      >
                        {isCameraOff ? "videocam_off" : "videocam"}
                      </span>
                    </button>
                    <button
                      onClick={leaveCall}
                      style={{
                        width: "1.75rem",
                        height: "1.75rem",
                        borderRadius: "0.375rem",
                        backgroundColor: "#ff4d4f",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background-color 0.2s ease",
                      }}
                      title="Leave Video Call"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1.05rem" }}
                      >
                        call_end
                      </span>
                    </button>
                  </div>
                )}
                <div className={styles.videoLabelLocal}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {isJoinedCall
                      ? isMicMuted
                        ? "mic_off"
                        : "mic"
                      : "videocam_off"}
                  </span>
                  You
                </div>
              </div>

              {/* Remote Streams */}
              {connectedUsers.map((peer) => {
                const isInCall = roomUsers.some(
                  (ru) =>
                    ru.socketId === peer.socketId ||
                    ru.user?._id === peer.user?._id,
                );
                const stream = remoteStreams[peer.socketId];
                const mediaState = remoteMediaStates[peer.socketId] || {
                  isCameraOff: true,
                  isMicMuted: true,
                };
                const showVideo = isInCall && stream && !mediaState.isCameraOff;
                return (
                  <div
                    key={peer.socketId}
                    className={styles.videoBox}
                    style={{
                      border: isInCall
                        ? "1px solid rgba(74, 222, 128, 0.2)"
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {showVideo ? (
                      <video
                        ref={(el) => {
                          if (el && el.srcObject !== stream) {
                            el.srcObject = stream;
                          }
                        }}
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <div className={styles.videoPlaceholder}>
                        <div
                          style={{
                            border: isInCall
                              ? "2px solid #4ade80"
                              : "2px solid rgba(255,255,255,0.1)",
                            borderRadius: "50%",
                          }}
                        >
                          <Avatar
                            src={peer.user?.avatar || peer.user?.avatarUrl || null}
                            name={
                              peer.user?.fullName ||
                              peer.user?.username ||
                              "Peer"
                            }
                            size={48}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.625rem",
                            color: "rgba(255, 255, 255, 0.45)",
                            marginTop: "0.25rem",
                            fontFamily: "var(--font-space-grotesk)",
                          }}
                        >
                          {isInCall
                            ? mediaState.isCameraOff
                              ? "Camera Off"
                              : "Active"
                            : "In Room"}
                        </span>
                      </div>
                    )}
                    <div className={styles.videoLabel}>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "0.875rem" }}
                      >
                        {isInCall
                          ? mediaState.isMicMuted
                            ? "mic_off"
                            : "mic"
                          : "meeting_room"}
                      </span>
                      {peer.user?.fullName || peer.user?.username || "Peer"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Interface */}
            <ChatPanel 
              socket={socketRef.current} 
              connectedUsers={connectedUsers} 
              roomUsers={roomUsers} 
              user={user} 
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
