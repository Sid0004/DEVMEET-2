import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import {
  getOrCreateRoomDoc,
  getRoomDoc,
  applyRoomDocUpdate,
  encodeRoomDocUpdate,
  addFileToRoomDoc,
  deleteFileFromRoomDoc,
  extractFilesFromDoc,
  persistRoomDocToDb,
} from "./editor.crdt.js";
import { Room } from "../room/room.model.js";

export const registerEditorHandlers = (io, socket) => {
  /**
   * Yjs Synchronization Protocol (Step 1 -> Step 2)
   * Client provides their state vector; server responds with missing delta.
   */
  socket.on("yjs-sync-step-1", async ({ roomId, stateVector }) => {
    const activeRoomId = roomId || socket.data.roomId;
    if (!activeRoomId) return;

    try {
      let roomDocEntry = getRoomDoc(activeRoomId);
      if (!roomDocEntry) {
        // Query database to seed initial files if doc is not currently in memory
        const room = await Room.findOne({ roomId: activeRoomId });
        roomDocEntry = getOrCreateRoomDoc(activeRoomId, room?.files || []);
      }

      const diffUpdate = encodeRoomDocUpdate(activeRoomId, stateVector);
      if (diffUpdate && diffUpdate.length > 0) {
        socket.emit("yjs-sync-step-2", {
          roomId: activeRoomId,
          update: diffUpdate,
        });
      }
    } catch (err) {
      console.error("[CRDT] Error in yjs-sync-step-1:", err);
    }
  });

  /**
   * Yjs Incremental CRDT Document Update
   * Applied to authoritative doc and broadcast to peers in the room.
   */
  socket.on("yjs-update", ({ roomId, update }) => {
    const activeRoomId = roomId || socket.data.roomId;
    if (!activeRoomId || !update) return;

    try {
      applyRoomDocUpdate(activeRoomId, update);
      // Fast binary relay to peers
      socket.to(activeRoomId).emit("yjs-update", {
        roomId: activeRoomId,
        update,
      });
    } catch (err) {
      console.error("[CRDT] Error applying yjs-update:", err);
    }
  });

  /**
   * Presence & Cursor Awareness (y-protocols/awareness)
   * Relays cursor positions, selection ranges, user names, and currentFile across peers.
   */
  socket.on("awareness-update", ({ roomId, update }) => {
    const activeRoomId = roomId || socket.data.roomId;
    if (!activeRoomId || !update) return;

    // Relay awareness update directly to other peers in room
    socket.to(activeRoomId).emit("awareness-update", {
      roomId: activeRoomId,
      update,
    });
  });

  /**
   * Collaborative File Creation
   */
  socket.on("file-create", async ({ roomId, file }) => {
    const activeRoomId = roomId || socket.data.roomId;
    if (!activeRoomId || !file?.name) return;

    try {
      addFileToRoomDoc(activeRoomId, file);
      socket.to(activeRoomId).emit("file-created", { file });

      // Immediate DB update for file creation
      const roomDocEntry = getRoomDoc(activeRoomId);
      if (roomDocEntry) {
        await persistRoomDocToDb(activeRoomId, roomDocEntry.doc);
      }
    } catch (err) {
      console.error("[CRDT] Error creating file:", err);
    }
  });

  /**
   * Collaborative File Deletion
   */
  socket.on("file-delete", async ({ roomId, fileName }) => {
    const activeRoomId = roomId || socket.data.roomId;
    if (!activeRoomId || !fileName) return;

    try {
      deleteFileFromRoomDoc(activeRoomId, fileName);
      socket.to(activeRoomId).emit("file-deleted", { fileName });

      const roomDocEntry = getRoomDoc(activeRoomId);
      if (roomDocEntry) {
        await persistRoomDocToDb(activeRoomId, roomDocEntry.doc);
      }
    } catch (err) {
      console.error("[CRDT] Error deleting file:", err);
    }
  });

  /**
   * Legacy Fallback handler for backwards compatibility
   */
  socket.on("files-change", ({ files }) => {
    const activeRoomId = socket.data.roomId;
    if (!activeRoomId || !files) return;

    socket.to(activeRoomId).emit("files-update", { files });

    Room.findOneAndUpdate({ roomId: activeRoomId }, { files }).catch((err) => {
      console.error("Failed to save room files:", err);
    });
  });
};
