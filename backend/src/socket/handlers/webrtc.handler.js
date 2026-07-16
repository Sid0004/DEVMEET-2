export const registerWebRTCHandlers = (io, socket) => {
  socket.on("webrtc-signal", ({ targetSocketId, signal }) => {
    // Forward signal to the target peer
    io.to(targetSocketId).emit("webrtc-signal", {
      senderSocketId: socket.id,
      signal,
    });
  });

  socket.on("join-call", async () => {
    const roomId = socket.data.roomId;
    const user = socket.data.user;
    if (!roomId || !user) return;

    socket.data.inCall = true;
    console.log(`User ${user.username || user.fullName} joined video call in room ${roomId}`);

    try {
      // Get all current sockets in this room who are in the call
      const sockets = await io.in(roomId).fetchSockets();
      const usersInCall = sockets
        .filter((s) => s.id !== socket.id && s.data.inCall === true)
        .map((s) => ({
          socketId: s.id,
          user: s.data.user,
        }));

      // Send the list of people already in the call to this user
      socket.emit("call-state", { users: usersInCall });

      // Notify everyone else in the room
      socket.to(roomId).emit("user-joined-call", {
        socketId: socket.id,
        user: user,
      });
    } catch (error) {
      console.error("Error in join-call handler:", error);
    }
  });

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
