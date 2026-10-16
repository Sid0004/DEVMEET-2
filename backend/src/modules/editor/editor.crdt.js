import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import { Room } from "../room/room.model.js";

// Active in-memory room CRDT documents
// Map<roomId, { doc: Y.Doc, awareness: awarenessProtocol.Awareness, saveTimeout: any, lastActive: number }>
const roomDocs = new Map();

/**
 * Extracts plain file array { name, content, language } from a Y.Doc
 * @param {Y.Doc} doc
 * @returns {Array<{ name: string, content: string, language: string }>}
 */
export const extractFilesFromDoc = (doc) => {
  if (!doc) return [];
  const metaArray = doc.getArray("files-meta").toArray();
  return metaArray.map((meta) => ({
    name: meta.name,
    language: meta.language || "typescript",
    content: doc.getText(meta.name).toString(),
  }));
};

/**
 * Persists the current CRDT document state to MongoDB Room
 * @param {string} roomId
 * @param {Y.Doc} doc
 */
export const persistRoomDocToDb = async (roomId, doc) => {
  if (!roomId || !doc) return;
  try {
    const files = extractFilesFromDoc(doc);
    if (files.length > 0) {
      await Room.findOneAndUpdate(
        { roomId },
        {
          files,
          code: files[0]?.content || "",
          primaryLanguage: files[0]?.language || "typescript",
        }
      );
    }
  } catch (err) {
    console.error(`[CRDT] Error persisting room doc to DB for room ${roomId}:`, err);
  }
};

/**
 * Gets or initializes an authoritative in-memory Y.Doc for a room.
 * @param {string} roomId
 * @param {Array<{ name: string, content: string, language: string }>} [initialFiles=[]]
 * @returns {{ doc: Y.Doc, awareness: awarenessProtocol.Awareness }}
 */
export const getOrCreateRoomDoc = (roomId, initialFiles = []) => {
  if (!roomId) throw new Error("Room ID is required to get or create Y.Doc");

  if (roomDocs.has(roomId)) {
    const entry = roomDocs.get(roomId);
    entry.lastActive = Date.now();
    return { doc: entry.doc, awareness: entry.awareness };
  }

  const doc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(doc);

  // Initialize files metadata and Y.Text structures
  const filesMeta = doc.getArray("files-meta");
  const seedFiles = initialFiles && initialFiles.length > 0 ? initialFiles : [
    {
      name: "main.ts",
      content: '// Welcome to DevMeet Workspace. Collaborators will sync in real time.\nconsole.log("hello");\n',
      language: "typescript",
    },
  ];

  doc.transact(() => {
    seedFiles.forEach((f) => {
      filesMeta.push([{ name: f.name, language: f.language || "typescript" }]);
      const yText = doc.getText(f.name);
      if (yText.length === 0 && f.content) {
        // Deduplicate repeated welcome header if corrupted from prior client syncs
        const cleaned = typeof f.content === "string"
          ? f.content.replace(
              /(\/\/\s*Welcome to DevMeet Workspace[^\n]*\n(?:console\.log\("hello"\);\n)?){2,}/g,
              '// Welcome to DevMeet Workspace. Collaborators will sync in real time.\nconsole.log("hello");\n'
            )
          : f.content;
        yText.insert(0, cleaned);
      }
    });
  });

  const entry = {
    doc,
    awareness,
    saveTimeout: null,
    lastActive: Date.now(),
  };

  // Schedule debounced database persistence on any CRDT edit
  doc.on("update", () => {
    entry.lastActive = Date.now();
    if (entry.saveTimeout) {
      clearTimeout(entry.saveTimeout);
    }
    entry.saveTimeout = setTimeout(() => {
      persistRoomDocToDb(roomId, doc);
      entry.saveTimeout = null;
    }, 2000);
  });

  roomDocs.set(roomId, entry);
  return { doc, awareness };
};

/**
 * Returns active room doc and awareness if present in memory.
 * @param {string} roomId
 */
export const getRoomDoc = (roomId) => {
  return roomDocs.get(roomId) || null;
};

/**
 * Applies a binary update to the room's CRDT document
 * @param {string} roomId
 * @param {Uint8Array|Buffer} update
 */
export const applyRoomDocUpdate = (roomId, update) => {
  const entry = roomDocs.get(roomId);
  if (!entry || !update) return;
  const uint8 = update instanceof Uint8Array ? update : new Uint8Array(update);
  Y.applyUpdate(entry.doc, uint8);
  entry.lastActive = Date.now();
};

/**
 * Encodes the diff update between the doc and a client's state vector
 * @param {string} roomId
 * @param {Uint8Array|Buffer} [stateVector]
 * @returns {Uint8Array|null}
 */
export const encodeRoomDocUpdate = (roomId, stateVector) => {
  const entry = roomDocs.get(roomId);
  if (!entry) return null;
  const sv = stateVector ? (stateVector instanceof Uint8Array ? stateVector : new Uint8Array(stateVector)) : undefined;
  return Y.encodeStateAsUpdate(entry.doc, sv);
};

/**
 * Adds a new file to the room's CRDT document
 * @param {string} roomId
 * @param {{ name: string, content?: string, language?: string }} file
 */
export const addFileToRoomDoc = (roomId, file) => {
  const entry = roomDocs.get(roomId);
  if (!entry || !file?.name) return;

  const doc = entry.doc;
  const filesMeta = doc.getArray("files-meta");
  const existing = filesMeta.toArray();

  if (existing.some((m) => m.name.toLowerCase() === file.name.toLowerCase())) {
    return;
  }

  doc.transact(() => {
    filesMeta.push([{ name: file.name, language: file.language || "typescript" }]);
    const yText = doc.getText(file.name);
    if (file.content) {
      yText.insert(0, file.content);
    }
  });
};

/**
 * Deletes a file from the room's CRDT document
 * @param {string} roomId
 * @param {string} fileName
 */
export const deleteFileFromRoomDoc = (roomId, fileName) => {
  const entry = roomDocs.get(roomId);
  if (!entry || !fileName) return;

  const doc = entry.doc;
  const filesMeta = doc.getArray("files-meta");
  const currentArray = filesMeta.toArray();
  const index = currentArray.findIndex((m) => m.name.toLowerCase() === fileName.toLowerCase());

  if (index !== -1) {
    doc.transact(() => {
      filesMeta.delete(index, 1);
      const yText = doc.getText(fileName);
      if (yText.length > 0) {
        yText.delete(0, yText.length);
      }
    });
  }
};

/**
 * Cleanly flushes pending saves and frees memory for inactive room docs
 * @param {string} roomId
 */
export const unloadRoomDoc = async (roomId) => {
  const entry = roomDocs.get(roomId);
  if (!entry) return;

  if (entry.saveTimeout) {
    clearTimeout(entry.saveTimeout);
    entry.saveTimeout = null;
  }

  await persistRoomDocToDb(roomId, entry.doc);
  entry.doc.destroy();
  roomDocs.delete(roomId);
};

/**
 * For testing purposes: cleans up all active room documents
 */
export const clearAllRoomDocs = () => {
  for (const [roomId, entry] of roomDocs.entries()) {
    if (entry.saveTimeout) clearTimeout(entry.saveTimeout);
    entry.doc.destroy();
  }
  roomDocs.clear();
};
