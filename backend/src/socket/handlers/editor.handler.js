import { Room } from "../../models/room.model.js";

export const registerEditorHandlers = (io, socket) => {
  socket.on("code-change", ({ code }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    // Broadcast to other users in the room
    socket.to(roomId).emit("code-update", { code });

    // Save code to DB in background
    Room.findOneAndUpdate({ roomId }, { code }).catch((err) => {
      console.error("Failed to save room code:", err);
    });
  });

  socket.on("files-change", ({ files, activeFileIndex }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    // Broadcast updated files and active file index to other users
    socket.to(roomId).emit("files-update", { files, activeFileIndex });

    // Update room files in DB, and synchronize legacy code / primaryLanguage fields with the first file
    const updateObj = { files };
    if (files && files[0]) {
      updateObj.code = files[0].content;
      updateObj.primaryLanguage = files[0].language;
    }

    Room.findOneAndUpdate({ roomId }, updateObj).catch((err) => {
      console.error("Failed to save room files:", err);
    });
  });
};
