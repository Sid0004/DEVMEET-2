import { Room } from "./room.model.js";
import { Message } from "../chat/message.model.js";

export const registerRoomHandlers = (io, socket) => {
  const authUser = socket.user;

  socket.on("join-room", async ({ roomId }) => {
    if (!roomId || !authUser) return;

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.user = authUser;

    console.log(`User ${authUser.username || authUser.fullName} joined room ${roomId}`);

    try {
      const sockets = await io.in(roomId).fetchSockets();
      const usersInRoom = sockets
        .filter((s) => s.id !== socket.id)
        .map((s) => ({
          socketId: s.id,
          user: s.data.user,
        }));

      const room = await Room.findOne({ roomId });
      
      if (!room) {
        socket.emit("room-error", { message: "Room not found. Please create a new workspace or enter a valid code." });
        return;
      }

      if (room.status === 'ended') {
        socket.emit("room-error", { message: "This session has been ended by the host." });
        return;
      }

      const isHost = room.host.toString() === authUser._id.toString();
      if (room.roomSettings?.isLocked && !isHost && !room.participants.some(p => p.toString() === authUser._id.toString())) {
        socket.emit("room-error", { message: "This room is locked by the host." });
        return;
      }

      if (room.organization && !isHost) {
        const userOrgs = authUser.organizations?.map(o => o.toString()) || [];
        if (!userOrgs.includes(room.organization.toString())) {
          socket.emit("room-error", { message: "You do not have permission to join this organization room." });
          return;
        }
      }

      // Ensure user is added to participants in database
      await Room.findOneAndUpdate({ roomId }, { $addToSet: { participants: authUser._id } });

      const dbMessages = await Message.find({ room: room._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("sender", "username fullName _id");
      
      const messages = dbMessages.reverse().map(msg => ({
        sender: {
          _id: msg.sender?._id,
          username: msg.sender?.username,
          fullName: msg.sender?.fullName
        },
        text: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      let files = room?.files || [];
      if (files.length === 0) {
        files = [
          {
            name: "main.ts",
            content: '// Welcome to DevMeet Workspace. Collaborators will sync in real time.\nconsole.log("hello")\n',
            language: "typescript",
          },
        ];
      }

      socket.emit("room-state", {
        files,
        messages,
        users: usersInRoom,
      });

      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        user: authUser,
      });
    } catch (error) {
      console.error("Error in join-room handler:", error);
    }
  });

  socket.on("end-session-broadcast", ({ roomId }) => {
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
