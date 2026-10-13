import { Room } from "../room/room.model.js";

// In-memory cache for ultra-fast real-time retrieval: roomId -> Array of stroke actions
const roomWhiteboardHistory = new Map();
const saveTimeouts = new Map();

// Debounced save to MongoDB so DB isn't flooded on every pixel
const scheduleRoomSave = (roomId) => {
  if (saveTimeouts.has(roomId)) {
    clearTimeout(saveTimeouts.get(roomId));
  }
  const timer = setTimeout(async () => {
    try {
      const history = roomWhiteboardHistory.get(roomId);
      if (history) {
        await Room.findOneAndUpdate(
          { roomId },
          { whiteboardData: JSON.stringify(history) }
        );
      }
    } catch (err) {
      console.error(`[Whiteboard] Failed to persist room ${roomId}:`, err);
    } finally {
      saveTimeouts.delete(roomId);
    }
  }, 2000); // 2 second debounce
  saveTimeouts.set(roomId, timer);
};

export const registerWhiteboardHandlers = (io, socket) => {
  // Client requests initial whiteboard drawing history
  socket.on("whiteboard:get-history", async () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    try {
      if (!roomWhiteboardHistory.has(roomId)) {
        const room = await Room.findOne({ roomId }).select("whiteboardData");
        if (room?.whiteboardData) {
          try {
            const parsed = JSON.parse(room.whiteboardData);
            if (Array.isArray(parsed)) {
              roomWhiteboardHistory.set(roomId, parsed);
            }
          } catch {
            roomWhiteboardHistory.set(roomId, []);
          }
        } else {
          roomWhiteboardHistory.set(roomId, []);
        }
      }

      const history = roomWhiteboardHistory.get(roomId) || [];
      socket.emit("whiteboard:history", history);
    } catch (err) {
      console.error(`[Whiteboard] Error fetching history for ${roomId}:`, err);
      socket.emit("whiteboard:history", []);
    }
  });

  // Client draws or places a shape
  socket.on("whiteboard:draw", (data) => {
    const roomId = socket.data.roomId;
    if (!roomId || !data) return;

    if (!roomWhiteboardHistory.has(roomId)) {
      roomWhiteboardHistory.set(roomId, []);
    }
    const history = roomWhiteboardHistory.get(roomId);
    history.push(data);

    // Keep history bounded to avoid memory saturation
    if (history.length > 5000) {
      history.splice(0, 1000);
    }

    scheduleRoomSave(roomId);
    socket.to(roomId).emit("whiteboard:draw", data);
  });

  // Clear whiteboard
  socket.on("whiteboard:clear", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    roomWhiteboardHistory.set(roomId, []);
    scheduleRoomSave(roomId);
    socket.to(roomId).emit("whiteboard:clear");
  });

  // Undo last action
  socket.on("whiteboard:undo", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    const history = roomWhiteboardHistory.get(roomId);
    if (history && history.length > 0) {
      // If the last item was a multi-point stroke or shape, pop it
      history.pop();
      scheduleRoomSave(roomId);
      io.in(roomId).emit("whiteboard:history", history);
    }
  });
};
