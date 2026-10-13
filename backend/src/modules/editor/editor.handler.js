import { Room } from "../room/room.model.js";

const saveTimeouts = new Map();

export const registerEditorHandlers = (io, socket) => {
  socket.on("files-change", ({ files }) => {
    const roomId = socket.data.roomId;
    if (!roomId || !files) return;

    // Instant peer broadcast (zero latency)
    socket.to(roomId).emit("files-update", { files });

    // Debounced database persistence (1.5 seconds) to prevent Atlas write bottlenecks
    if (saveTimeouts.has(roomId)) {
      clearTimeout(saveTimeouts.get(roomId));
    }

    const timer = setTimeout(() => {
      Room.findOneAndUpdate({ roomId }, { files }).catch((err) => {
        console.error("Failed to save room files:", err);
      });
      saveTimeouts.delete(roomId);
    }, 1500);

    saveTimeouts.set(roomId, timer);
  });
};
