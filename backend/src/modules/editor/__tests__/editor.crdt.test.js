import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import { jest } from "@jest/globals";
import { Room } from "../../room/room.model.js";
import {
  getOrCreateRoomDoc,
  getRoomDoc,
  extractFilesFromDoc,
  applyRoomDocUpdate,
  encodeRoomDocUpdate,
  addFileToRoomDoc,
  deleteFileFromRoomDoc,
  persistRoomDocToDb,
  unloadRoomDoc,
  clearAllRoomDocs,
} from "../editor.crdt.js";

describe("Scale-Grade CRDT & Presence Sync Engine Tests", () => {
  const testRoomId = "crdt_test_room_888";

  beforeEach(() => {
    jest.restoreAllMocks();
    clearAllRoomDocs();
  });

  afterAll(() => {
    clearAllRoomDocs();
  });

  // ==========================================
  // 1. CRDT DOCUMENT INITIALIZATION
  // ==========================================
  describe("Room CRDT Document Initialization & Caching", () => {
    it("should initialize a new Y.Doc with default files if none provided", () => {
      const { doc, awareness } = getOrCreateRoomDoc(testRoomId);

      expect(doc).toBeDefined();
      expect(awareness).toBeDefined();

      const files = extractFilesFromDoc(doc);
      expect(files.length).toBe(1);
      expect(files[0].name).toBe("main.ts");
      expect(files[0].content).toContain("Welcome to DevMeet Workspace");
      expect(files[0].language).toBe("typescript");
    });

    it("should initialize a Y.Doc with provided custom room files", () => {
      const customFiles = [
        { name: "index.js", content: "console.log('index');", language: "javascript" },
        { name: "styles.css", content: "body { margin: 0; }", language: "css" },
      ];

      const { doc } = getOrCreateRoomDoc(testRoomId, customFiles);
      const extracted = extractFilesFromDoc(doc);

      expect(extracted.length).toBe(2);
      expect(extracted[0].name).toBe("index.js");
      expect(extracted[0].content).toBe("console.log('index');");
      expect(extracted[1].name).toBe("styles.css");
      expect(extracted[1].content).toBe("body { margin: 0; }");
    });

    it("should reuse the existing in-memory Y.Doc on subsequent calls", () => {
      const { doc: firstDoc } = getOrCreateRoomDoc(testRoomId);
      const { doc: secondDoc } = getOrCreateRoomDoc(testRoomId);

      expect(firstDoc).toBe(secondDoc);
    });

    it("should retrieve active room doc via getRoomDoc()", () => {
      getOrCreateRoomDoc(testRoomId);
      const entry = getRoomDoc(testRoomId);

      expect(entry).toBeDefined();
      expect(entry.doc).toBeDefined();
      expect(entry.awareness).toBeDefined();
    });
  });

  // ==========================================
  // 2. CRDT CONVERGENCE & MULTI-CLIENT EDITS
  // ==========================================
  describe("CRDT Mathematical Convergence", () => {
    it("should converge two concurrent edits at the exact same offset without conflict", () => {
      // Server authoritative doc
      const { doc: serverDoc } = getOrCreateRoomDoc(testRoomId, [
        { name: "main.ts", content: "BASE_CODE\n", language: "typescript" },
      ]);

      // Client A initializes from server
      const clientADoc = new Y.Doc();
      const serverState = Y.encodeStateAsUpdate(serverDoc);
      Y.applyUpdate(clientADoc, serverState);

      // Client B initializes from server
      const clientBDoc = new Y.Doc();
      Y.applyUpdate(clientBDoc, serverState);

      const clientAText = clientADoc.getText("main.ts");
      const clientBText = clientBDoc.getText("main.ts");

      // Concurrent edits: Client A inserts at start, Client B also inserts at start
      clientAText.insert(0, "// Client A Line 1\n");
      clientBText.insert(0, "// Client B Line 1\n");

      // Client A sends update to server
      const updateA = Y.encodeStateAsUpdate(clientADoc);
      applyRoomDocUpdate(testRoomId, updateA);

      // Client B sends update to server
      const updateB = Y.encodeStateAsUpdate(clientBDoc);
      applyRoomDocUpdate(testRoomId, updateB);

      // Clients receive server's final converged state
      const finalServerUpdate = Y.encodeStateAsUpdate(serverDoc);
      Y.applyUpdate(clientADoc, finalServerUpdate);
      Y.applyUpdate(clientBDoc, finalServerUpdate);

      const serverText = serverDoc.getText("main.ts").toString();
      const clientAResult = clientAText.toString();
      const clientBResult = clientBText.toString();

      // Convergence assertion: ALL docs must match character-for-character
      expect(clientAResult).toBe(serverText);
      expect(clientBResult).toBe(serverText);
      expect(serverText).toContain("// Client A Line 1\n");
      expect(serverText).toContain("// Client B Line 1\n");
      expect(serverText).toContain("BASE_CODE\n");
    });

    it("should correctly compute and apply state-vector differential updates (sync step 1 & 2)", () => {
      const { doc: serverDoc } = getOrCreateRoomDoc(testRoomId, [
        { name: "main.ts", content: "Original line\n", language: "typescript" },
      ]);

      // Outdated client
      const clientDoc = new Y.Doc();
      const clientStateVector = Y.encodeStateVector(clientDoc);

      // Server generates diff for client's state vector
      const diffUpdate = encodeRoomDocUpdate(testRoomId, clientStateVector);
      expect(diffUpdate).toBeDefined();

      Y.applyUpdate(clientDoc, diffUpdate);
      expect(clientDoc.getText("main.ts").toString()).toBe("Original line\n");

      // Server adds more text
      serverDoc.getText("main.ts").insert(14, "New addition\n");

      // Client requests sync step 2 with updated vector
      const newClientVector = Y.encodeStateVector(clientDoc);
      const step2Update = encodeRoomDocUpdate(testRoomId, newClientVector);

      Y.applyUpdate(clientDoc, step2Update);
      expect(clientDoc.getText("main.ts").toString()).toBe("Original line\nNew addition\n");
    });
  });

  // ==========================================
  // 3. MULTI-FILE CONCURRENCY & ISOLATION
  // ==========================================
  describe("Multi-File Concurrency & Operations", () => {
    it("should add a new file dynamically without disrupting existing files", () => {
      const { doc } = getOrCreateRoomDoc(testRoomId, [
        { name: "main.ts", content: "main content", language: "typescript" },
      ]);

      addFileToRoomDoc(testRoomId, {
        name: "helper.ts",
        content: "export const add = (a, b) => a + b;",
        language: "typescript",
      });

      const files = extractFilesFromDoc(doc);
      expect(files.length).toBe(2);
      expect(files[0].name).toBe("main.ts");
      expect(files[0].content).toBe("main content");
      expect(files[1].name).toBe("helper.ts");
      expect(files[1].content).toBe("export const add = (a, b) => a + b;");
    });

    it("should prevent duplicate files with identical names", () => {
      const { doc } = getOrCreateRoomDoc(testRoomId, [
        { name: "main.ts", content: "main content", language: "typescript" },
      ]);

      addFileToRoomDoc(testRoomId, { name: "main.ts", content: "duplicate" });

      const files = extractFilesFromDoc(doc);
      expect(files.length).toBe(1);
      expect(files[0].content).toBe("main content");
    });

    it("should cleanly delete a file from metadata and text buffer", () => {
      const { doc } = getOrCreateRoomDoc(testRoomId, [
        { name: "main.ts", content: "main content", language: "typescript" },
        { name: "temp.txt", content: "temporary", language: "plaintext" },
      ]);

      deleteFileFromRoomDoc(testRoomId, "temp.txt");

      const files = extractFilesFromDoc(doc);
      expect(files.length).toBe(1);
      expect(files[0].name).toBe("main.ts");
      expect(doc.getText("temp.txt").toString()).toBe("");
    });
  });

  // ==========================================
  // 4. PRESENCE & AWARENESS PROTOCOL
  // ==========================================
  describe("Presence & Cursor Awareness", () => {
    it("should broadcast awareness updates with user metadata and cursor coordinates", () => {
      const clientADoc = new Y.Doc();
      const clientBDoc = new Y.Doc();

      const awarenessA = new awarenessProtocol.Awareness(clientADoc);
      const awarenessB = new awarenessProtocol.Awareness(clientBDoc);

      // Client A sets local cursor state
      awarenessA.setLocalStateField("user", {
        name: "Sarah Dev",
        color: "#6366f1",
        avatar: "https://example.com/avatar.png",
      });
      awarenessA.setLocalStateField("cursor", {
        file: "main.ts",
        line: 12,
        column: 4,
      });

      // Encode awareness update from Client A
      const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(awarenessA, [clientADoc.clientID]);

      // Apply awareness update to Client B
      awarenessProtocol.applyAwarenessUpdate(awarenessB, awarenessUpdate, "remote");

      const statesB = awarenessB.getStates();
      const clientAStateOnB = statesB.get(clientADoc.clientID);

      expect(clientAStateOnB).toBeDefined();
      expect(clientAStateOnB.user.name).toBe("Sarah Dev");
      expect(clientAStateOnB.user.color).toBe("#6366f1");
      expect(clientAStateOnB.cursor.file).toBe("main.ts");
      expect(clientAStateOnB.cursor.line).toBe(12);
      expect(clientAStateOnB.cursor.column).toBe(4);
    });
  });

  // ==========================================
  // 5. DATABASE PERSISTENCE & LIFECYCLE
  // ==========================================
  describe("Database Persistence & Lifecycle", () => {
    it("should save current CRDT files to MongoDB via persistRoomDocToDb", async () => {
      const { doc } = getOrCreateRoomDoc(testRoomId, [
        { name: "app.ts", content: "console.log('devmeet');", language: "typescript" },
      ]);

      const findOneAndUpdateSpy = jest.spyOn(Room, "findOneAndUpdate").mockResolvedValue({});

      await persistRoomDocToDb(testRoomId, doc);

      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        { roomId: testRoomId },
        {
          files: [
            {
              name: "app.ts",
              language: "typescript",
              content: "console.log('devmeet');",
            },
          ],
          code: "console.log('devmeet');",
          primaryLanguage: "typescript",
        }
      );
    });

    it("should flush saves and unload doc from memory via unloadRoomDoc", async () => {
      const { doc } = getOrCreateRoomDoc(testRoomId);
      const findOneAndUpdateSpy = jest.spyOn(Room, "findOneAndUpdate").mockResolvedValue({});

      await unloadRoomDoc(testRoomId);

      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
      expect(getRoomDoc(testRoomId)).toBeNull();
    });
  });
});
