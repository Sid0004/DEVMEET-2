import { Room } from "../../models/room.model.js";

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

    // Save message to room in DB
    Room.findOneAndUpdate(
      { roomId },
      { $push: { messages: chatMsg } }
    ).catch((err) => {
      console.error("Failed to save chat message:", err);
    });
  });
};
