import { Room } from "../../models/room.model.js";
import { Message } from "../../models/message.model.js";

export const registerChatHandlers = (io, socket) => {

  socket.on("send-message", async ({ message }) => {

    const roomId = socket.data.roomId;
    const user = socket.data.user;

    if (!roomId || !user) return;

    const chatMsg = {
      sender: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
      },
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Broadcast to everyone in the room (including sender)
    io.to(roomId).emit("receive-message", chatMsg);

    try {
      // Find the room document to get its ObjectId
      const roomDoc = await Room.findOne({ roomId });
      if (roomDoc) {
        // Save message to Message model
        await Message.create({
          room: roomDoc._id,
          sender: user._id,
          content: message,
          type: "text"
        });
      }
    } catch (err) {
      console.error("Failed to save chat message:", err);
    }
  });

  socket.on("typing", () => {
    const roomId = socket.data.roomId;
    const user = socket.data.user;
    if (!roomId || !user) return;

    // Broadcast to everyone ELSE in the room
    socket.to(roomId).emit("user-typing", { user });
  });

  socket.on("stop-typing", () => {
    const roomId = socket.data.roomId;
    const user = socket.data.user;
    if (!roomId || !user) return;

    socket.to(roomId).emit("user-stopped-typing", { userId: user._id });
  });
};
