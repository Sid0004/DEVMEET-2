import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Import modular handlers
import { registerRoomHandlers } from "./handlers/room.handler.js";
import { registerEditorHandlers } from "./handlers/editor.handler.js";
import { registerChatHandlers } from "./handlers/chat.handler.js";
import { registerWebRTCHandlers } from "./handlers/webrtc.handler.js";

export const initSocket = (server) => {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : ["http://localhost:3000"];

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token && socket.handshake.headers?.cookie) {
        const cookieMap = Object.fromEntries(
          socket.handshake.headers.cookie.split(";").map((c) => {
            const parts = c.trim().split("=");
            return [parts[0], parts.slice(1).join("=")];
          })
        );
        token = cookieMap["accessToken"];
      }
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      if (!user) {
        return next(new Error("Invalid token"));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error("Authentication failed: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    const authUser = socket.user;
    console.log(`Socket connected: ${socket.id} - User: ${authUser?._id}`);

    // Register modular handlers
    registerRoomHandlers(io, socket);
    registerEditorHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerWebRTCHandlers(io, socket);
  });

  return io;
};
