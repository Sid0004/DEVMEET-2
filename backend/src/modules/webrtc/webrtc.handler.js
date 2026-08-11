export const registerWebRTCHandlers = (io, socket) => {
  // Direct P2P / SFU Signaling Relay
  socket.on("webrtc-signal", ({ targetSocketId, signal }) => {
    if (!targetSocketId || !signal) return;
    io.to(targetSocketId).emit("webrtc-signal", {
      senderSocketId: socket.id,
      signal,
    });
  });

  // User Joins Video Call
  socket.on("join-call", async () => {
    const roomId = socket.data.roomId;
    const user = socket.data.user;
    if (!roomId || !user) return;

    socket.data.inCall = true;
    socket.data.mediaState = socket.data.mediaState || { isMicMuted: false, isCameraOff: false };

    console.log(`User ${user.username || user.fullName} joined video call in room ${roomId}`);

    try {
      const sockets = await io.in(roomId).fetchSockets();
      const userMap = new Map();
      sockets
        .filter((s) => s.id !== socket.id && s.data.inCall === true)
        .forEach((s) => {
          const key = s.data.user?._id ? String(s.data.user._id) : s.id;
          userMap.set(key, {
            socketId: s.id,
            user: s.data.user,
            mediaState: s.data.mediaState || { isMicMuted: false, isCameraOff: false },
          });
        });
      const usersInCall = Array.from(userMap.values());

      socket.emit("call-state", { users: usersInCall });

      socket.to(roomId).emit("user-joined-call", {
        socketId: socket.id,
        user: user,
        mediaState: socket.data.mediaState,
      });
    } catch (error) {
      console.error("Error in join-call handler:", error);
    }
  });

  // Toggle Mic / Camera state live
  socket.on("toggle-media", ({ isMicMuted, isCameraOff }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    socket.data.mediaState = { isMicMuted, isCameraOff };

    socket.to(roomId).emit("peer-media-toggled", {
      socketId: socket.id,
      isMicMuted,
      isCameraOff,
    });
  });

  // User Leaves Video Call
  socket.on("leave-call", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    socket.data.inCall = false;
    console.log(`Socket left call: ${socket.id}`);

    socket.to(roomId).emit("user-left-call", {
      socketId: socket.id,
    });
  });
};
