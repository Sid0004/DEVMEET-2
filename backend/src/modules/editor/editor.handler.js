import { Room } from "../room/room.model.js";

export const registerEditorHandlers = (io, socket) => {
  socket.on("files-change", ({ files, activeFileIndex }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    socket.to(roomId).emit("files-update", { files, activeFileIndex });

    const updateObj = { files };

    Room.findOneAndUpdate({ roomId }, updateObj).catch((err) => {
      console.error("Failed to save room files:", err);
    });
  });
};
