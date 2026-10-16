"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { API_BASE_URL, apiRequest } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/authSlice";
import { setMessages, addMessage, incrementUnread } from "@/redux/features/chatSlice";

/**
 * useWorkspaceRoom Hook
 * Encapsulates the entire Room Lifecycle & Session Gateway:
 * - Room verification & metadata fetching
 * - Unauthenticated guest discovery & token onboarding
 * - Socket.IO authenticated gateway connection
 * - Peer presence management & graceful room state transitions (active, locked, ended, not-found)
 */
export function useWorkspaceRoom({
  roomId,
  isMounted,
  onFilesReceived,
  onSoundNotification,
  sideDrawer = "none",
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  // Room Lifecycle State: 'loading' | 'active' | 'locked' | 'ended' | 'not-found' | 'error'
  const [roomStatus, setRoomStatus] = useState("loading");
  const [roomError, setRoomError] = useState("");
  const [roomName, setRoomName] = useState("DevMeet Session");
  const [roomHost, setRoomHost] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);

  // Peer & Socket Presence
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeSocket, setActiveSocket] = useState(null);
  const socketRef = useRef(null);

  // Guest Onboarding State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [publicRoomInfo, setPublicRoomInfo] = useState(null);

  // Track latest sideDrawer and callbacks in stable refs to prevent re-render loops
  const sideDrawerRef = useRef(sideDrawer);
  useEffect(() => {
    sideDrawerRef.current = sideDrawer;
  }, [sideDrawer]);

  const onFilesReceivedRef = useRef(onFilesReceived);
  useEffect(() => {
    onFilesReceivedRef.current = onFilesReceived;
  }, [onFilesReceived]);

  const onSoundNotificationRef = useRef(onSoundNotification);
  useEffect(() => {
    onSoundNotificationRef.current = onSoundNotification;
  }, [onSoundNotification]);

  // 1. Fetch current user or prompt guest flow if visiting an invited room
  useEffect(() => {
    if (!isMounted) return;

    let isCancelled = false;

    const fetchUser = async () => {
      try {
        const response = await apiRequest("/api/v1/users/current-user");
        if (response?.data && !isCancelled) {
          dispatch(
            setCredentials({
              user: response.data,
              token: response.data.accessToken,
            }),
          );
        }
      } catch (err) {
        if (isCancelled) return;
        console.warn("[Workspace] User not authenticated:", err?.message);

        if (roomId) {
          // Unauthenticated user accessing an invited workspace: fetch public preview for guest modal
          try {
            const pubRes = await fetch(`${API_BASE_URL}/api/v1/rooms/${roomId}/public-info`);
            const pubData = await pubRes.json();
            if (pubData?.data && !isCancelled) {
              setPublicRoomInfo(pubData.data);
              setRoomName(pubData.data.roomName);
              if (pubData.data.host) setRoomHost(pubData.data.host);

              if (pubData.data.status === "ended") {
                setRoomStatus("ended");
                setRoomError("This session has already ended.");
                return;
              }
              if (pubData.data.isLocked) {
                setRoomStatus("locked");
                setRoomError("This room is locked by the host.");
                return;
              }
            } else if (pubRes.status === 404 && !isCancelled) {
              setRoomStatus("not-found");
              setRoomError(`Room "${roomId}" does not exist or has expired.`);
              return;
            }
          } catch (pubErr) {
            console.error("[Workspace] Failed to fetch public room preview:", pubErr);
          }
          if (!isCancelled) {
            setIsGuestModalOpen(true);
          }
        } else if (
          err?.message?.includes("Session expired") ||
          err?.message?.includes("unauthorized") ||
          err?.message?.includes("Unauthorized")
        ) {
          router.push("/login");
        }
      }
    };

    if (!user) {
      fetchUser();
    }

    return () => {
      isCancelled = true;
    };
  }, [user, dispatch, router, isMounted, roomId]);

  // 2. Fetch Detailed Room Info once session is active
  const fetchRoomDetails = useCallback(async () => {
    if (!roomId || !user) return;

    try {
      const response = await apiRequest(`/api/v1/rooms/${roomId}`);
      if (response?.data) {
        const data = response.data;
        setRoomInfo(data);
        setRoomName(data.roomName);
        if (data.host) setRoomHost(data.host);

        if (data.status === "ended") {
          setRoomStatus("ended");
          setRoomError("This session has been concluded by the host.");
          return;
        }

        if (data.roomSettings?.isLocked) {
          const isHost = !user.isGuest && data.host?._id?.toString() === user._id?.toString();
          if (!isHost) {
            setRoomStatus("locked");
            setRoomError("This room is locked by the host.");
            return;
          }
        }

        setRoomStatus("active");

        if (onFilesReceivedRef.current && data.files) {
          let roomFiles = data.files;
          if (roomFiles.length === 0) {
            const lang = data.primaryLanguage || "TypeScript";
            const ext = lang.toLowerCase() === "python" ? "py" : "ts";
            roomFiles = [
              {
                name: `main.${ext}`,
                content:
                  data.code ||
                  "// Welcome to DevMeet Workspace. Collaborators will sync in real time.\n",
                language: lang,
              },
            ];
          }
          onFilesReceivedRef.current(roomFiles);
        }
      }
    } catch (err) {
      console.error("[Workspace] Failed to fetch room info:", err);
      if (err?.status === 404 || err?.message?.includes("not exist")) {
        setRoomStatus("not-found");
        setRoomError(`Workspace "${roomId}" was not found.`);
      } else if (err?.status === 403 || err?.message?.includes("locked")) {
        setRoomStatus("locked");
        setRoomError(err.message || "This room is locked by the host.");
      } else {
        setRoomStatus("error");
        setRoomError(err?.message || "Failed to join room.");
      }
    }
  }, [roomId, user]);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!isMounted || !roomId || !user) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    const timer = setTimeout(() => {
      fetchRoomDetails();
    }, 0);
    return () => clearTimeout(timer);
  }, [roomId, isMounted, user, fetchRoomDetails]);

  // 3. Socket.IO Gateway Setup & Event Handlers
  useEffect(() => {
    if (!isMounted || !user || !roomId) return;

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      auth: { token },
    });
    socketRef.current = socket;
    const timer = setTimeout(() => {
      setActiveSocket(socket);
    }, 0);

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log(`[Socket] Connected: ${socket.id} - Joining room: ${roomId}`);
      socket.emit("join-room", { roomId });
    });


    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on(
      "room-state",
      async ({
        code: existingCode,
        language: roomLang,
        files: roomFiles,
        messages: existingMessages,
        users: roomUsersList,
      }) => {
        setRoomStatus("active");

        if (roomFiles && roomFiles.length > 0 && onFilesReceivedRef.current) {
          onFilesReceivedRef.current(roomFiles);
        } else if (existingCode && onFilesReceivedRef.current) {
          onFilesReceivedRef.current([
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
      },
    );

    socket.on("room-error", ({ message }) => {
      console.warn("[Socket] Room error:", message);
      if (message?.toLowerCase().includes("not found")) {
        setRoomStatus("not-found");
      } else if (message?.toLowerCase().includes("locked")) {
        setRoomStatus("locked");
      } else if (message?.toLowerCase().includes("ended")) {
        setRoomStatus("ended");
      } else {
        setRoomStatus("error");
      }
      setRoomError(message || "An error occurred with this room.");
    });

    socket.on("session-ended", ({ message }) => {
      console.log("[Socket] Session ended by host:", message);
      setRoomStatus("ended");
      setRoomError(message || "The host has ended this session.");
    });

    socket.on("user-joined", ({ socketId, user: joinedUser }) => {
      console.log("[Socket] User joined:", joinedUser?.username || joinedUser?.fullName);
      if (onSoundNotificationRef.current) {
        onSoundNotificationRef.current(true);
      }
      setConnectedUsers((prev) => {
        const filtered = prev.filter((u) => u.socketId !== socketId);
        return [...filtered, { socketId, user: joinedUser }];
      });
      dispatch(
        addMessage({
          type: "system",
          text: `${joinedUser?.fullName || joinedUser?.username || "A collaborator"} joined the room`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }),
      );
    });

    socket.on("user-disconnected", ({ socketId, user: leftUser }) => {
      console.log("[Socket] User disconnected:", socketId);
      if (onSoundNotificationRef.current) {
        onSoundNotificationRef.current(false);
      }
      setConnectedUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      if (leftUser) {
        dispatch(
          addMessage({
            type: "system",
            text: `${leftUser?.fullName || leftUser?.username || "A collaborator"} left the room`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }),
        );
      }
    });

    socket.on("receive-message", (message) => {
      dispatch(addMessage(message));
      if (sideDrawerRef.current !== "chat") {
        dispatch(incrementUnread());
        if (onSoundNotificationRef.current) {
          onSoundNotificationRef.current(false);
        }
      }
    });

    return () => {
      console.log("[Socket] Cleaning up workspace socket...");
      socket.disconnect();
      socketRef.current = null;
      setActiveSocket(null);
    };
  }, [isMounted, user, token, roomId, dispatch]);

  const handleGuestJoinSuccess = (guestData) => {
    dispatch(
      setCredentials({
        user: guestData.user,
        token: guestData.accessToken,
      }),
    );
    setIsGuestModalOpen(false);
  };

  const retryConnection = () => {
    hasFetchedRef.current = false;
    setRoomStatus("loading");
    setRoomError("");
    fetchRoomDetails();
  };

  return {
    roomId,
    roomStatus,
    roomError,
    roomName,
    setRoomName,
    roomHost,
    setRoomHost,
    roomInfo,
    socket: activeSocket,
    socketRef,
    socketConnected,
    connectedUsers,
    setConnectedUsers,
    isGuestModalOpen,
    setIsGuestModalOpen,
    publicRoomInfo,
    handleGuestJoinSuccess,
    retryConnection,
    user,
    token,
  };
}
