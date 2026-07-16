import { Room } from "../../models/room.model.js";

export const registerRoomHandlers = (io, socket) => {
  const authUser = socket.user;

  socket.on("join-room", async ({ roomId }) => {
    if (!roomId || !authUser) return;

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.user = authUser;

    console.log(`User ${authUser.username || authUser.fullName} joined room ${roomId}`);

    try {
      // Get all current sockets in this room
      const sockets = await io.in(roomId).fetchSockets();
      const usersInRoom = sockets
        .filter((s) => s.id !== socket.id)
        .map((s) => ({
          socketId: s.id,
          user: s.data.user,
        }));

      // Fetch current room state (code & language) from DB
      const room = await Room.findOne({ roomId });
      
      if (!room) {
        socket.emit("room-error", { message: "Room not found. Please create a new workspace or enter a valid code." });
        return;
      }

      if (room.status === 'ended') {
        socket.emit("room-error", { message: "This session has been ended by the host." });
        return;
      }

      const currentCode = room ? room.code || "" : "";
      const language = room ? room.primaryLanguage || "TypeScript" : "TypeScript";
      const messages = room ? room.messages || [] : [];

      // Build fallback file list if room has no files yet
      let files = room?.files || [];
      if (files.length === 0) {
        const ext = language.toLowerCase() === "python" ? "py" : "ts";
        files = [
          {
            name: `main.${ext}`,
            content:
              currentCode ||
              '// Welcome to DevMeet Workspace. Collaborators will sync in real time.\nconsole.log("hello")\n',
            language: language,
          },
        ];
      }

      // Send current state to the joining user
      socket.emit("room-state", {
        code: currentCode,
        language,
        files,
        messages,
        users: usersInRoom,
      });

      // Notify everyone else in the room
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        user: authUser,
      });
    } catch (error) {
      console.error("Error in join-room handler:", error);
    }
  });

  socket.on("end-session-broadcast", ({ roomId }) => {
    // Allows the host to broadcast to all users that the session is ended
    socket.to(roomId).emit("session-ended", { message: "The host has ended the session." });
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("user-disconnected", {
          socketId: socket.id,
          user: socket.data.user,
        });
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
};
