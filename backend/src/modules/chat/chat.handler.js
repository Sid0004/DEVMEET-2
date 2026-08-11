import { Room } from "../room/room.model.js";
import { Message } from "./message.model.js";

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 3000;
const MAX_MESSAGES_PER_WINDOW = 5;

export const registerChatHandlers = (io, socket) => {
  // In-memory rate limiting tracker for the socket session
  socket.data.messageTimestamps = socket.data.messageTimestamps || [];

  socket.on("send-message", async ({ message, type = "text", clientMsgId }) => {
    const roomId = socket.data.roomId;
    const user = socket.data.user;

    if (!roomId || !user || !message) return;

    // 1. Anti-Spam Rate Limiting
    const now = Date.now();
    socket.data.messageTimestamps = socket.data.messageTimestamps.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS
    );

    if (socket.data.messageTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
      socket.emit("chat-error", {
        message: "Slow down! You are sending messages too quickly.",
      });
      return;
    }

    socket.data.messageTimestamps.push(now);

    // 2. Input Sanitization & Truncation
    const trimmedMessage = String(message).trim().slice(0, MAX_MESSAGE_LENGTH);
    if (trimmedMessage.length === 0) return;

    const chatMsg = {
      _id: clientMsgId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      text: trimmedMessage,
      type: type || "text",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // 3. Instant Broadcast (Zero Latency)
    io.to(roomId).emit("receive-message", chatMsg);

    // 4. Asynchronous Database Persistence (Non-Blocking)
    try {
      const roomDoc = await Room.findOne({ roomId }).select("_id");
      if (roomDoc) {
        await Message.create({
          room: roomDoc._id,
          sender: user._id,
          content: trimmedMessage,
          type: type || "text",
        });
      }
    } catch (err) {
      console.error("Failed to persist chat message:", err);
    }
  });

  socket.on("typing", () => {
    const roomId = socket.data.roomId;
    const user = socket.data.user;
    if (!roomId || !user) return;

    socket.to(roomId).emit("user-typing", { user });
  });

  socket.on("stop-typing", () => {
    const roomId = socket.data.roomId;
    const user = socket.data.user;
    if (!roomId || !user) return;

    socket.to(roomId).emit("user-stopped-typing", { userId: user._id });
  });
};
