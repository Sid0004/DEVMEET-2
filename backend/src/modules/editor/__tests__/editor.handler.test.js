import * as Y from "yjs";
import { jest } from "@jest/globals";
import { registerEditorHandlers } from "../editor.handler.js";
import * as crdtEngine from "../editor.crdt.js";
import { Room } from "../../room/room.model.js";

describe("Editor Socket Handlers & Synchronization Tests", () => {
  let mockIo;
  let mockSocket;
  let listeners = {};
  const testRoomId = "socket_crdt_room_999";

  beforeEach(() => {
    jest.restoreAllMocks();
    crdtEngine.clearAllRoomDocs();
    listeners = {};

    mockSocket = {
      id: "socket_test_1",
      data: { roomId: testRoomId },
      on: jest.fn((event, callback) => {
        listeners[event] = callback;
      }),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };

    mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    jest.spyOn(Room, "findOneAndUpdate").mockReturnValue({
      catch: jest.fn(),
      then: jest.fn((resolve) => resolve({})),
    });

    registerEditorHandlers(mockIo, mockSocket);
  });

  afterAll(() => {
    crdtEngine.clearAllRoomDocs();
  });

  describe("yjs-sync-step-1", () => {
    it("should respond with yjs-sync-step-2 containing state diff", async () => {
      // Seed room in memory
      crdtEngine.getOrCreateRoomDoc(testRoomId, [
        { name: "main.ts", content: "console.log('hello')", language: "typescript" },
      ]);

      const clientDoc = new Y.Doc();
      const stateVector = Y.encodeStateVector(clientDoc);

      await listeners["yjs-sync-step-1"]({ roomId: testRoomId, stateVector });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "yjs-sync-step-2",
        expect.objectContaining({
          roomId: testRoomId,
          update: expect.any(Uint8Array),
        })
      );
    });

    it("should seed doc from database if not yet cached in memory", async () => {
      jest.spyOn(Room, "findOne").mockResolvedValue({
        roomId: testRoomId,
        files: [{ name: "db.ts", content: "dbContent", language: "typescript" }],
      });

      const clientDoc = new Y.Doc();
      const stateVector = Y.encodeStateVector(clientDoc);

      await listeners["yjs-sync-step-1"]({ roomId: testRoomId, stateVector });

      expect(Room.findOne).toHaveBeenCalledWith({ roomId: testRoomId });
      expect(mockSocket.emit).toHaveBeenCalledWith("yjs-sync-step-2", expect.any(Object));
    });
  });

  describe("yjs-update", () => {
    it("should apply update to CRDT doc and broadcast to room peers", () => {
      crdtEngine.getOrCreateRoomDoc(testRoomId, [
        { name: "main.ts", content: "Initial", language: "typescript" },
      ]);

      const clientDoc = new Y.Doc();
      clientDoc.getText("main.ts").insert(0, "Client Edit ");
      const update = Y.encodeStateAsUpdate(clientDoc);

      listeners["yjs-update"]({ roomId: testRoomId, update });

      expect(mockSocket.to).toHaveBeenCalledWith(testRoomId);
      expect(mockSocket.emit).toHaveBeenCalledWith("yjs-update", {
        roomId: testRoomId,
        update,
      });

      const serverDoc = crdtEngine.getRoomDoc(testRoomId).doc;
      expect(serverDoc.getText("main.ts").toString()).toContain("Client Edit");
    });
  });

  describe("awareness-update", () => {
    it("should relay cursor awareness updates to room peers", () => {
      const awarenessBuffer = new Uint8Array([1, 2, 3, 4]);

      listeners["awareness-update"]({ roomId: testRoomId, update: awarenessBuffer });

      expect(mockSocket.to).toHaveBeenCalledWith(testRoomId);
      expect(mockSocket.emit).toHaveBeenCalledWith("awareness-update", {
        roomId: testRoomId,
        update: awarenessBuffer,
      });
    });
  });

  describe("file-create & file-delete", () => {
    it("should create file in CRDT doc, broadcast file-created, and persist to DB", async () => {
      crdtEngine.getOrCreateRoomDoc(testRoomId, [
        { name: "main.ts", content: "", language: "typescript" },
      ]);

      const findOneAndUpdateSpy = jest.spyOn(Room, "findOneAndUpdate").mockResolvedValue({});

      const newFile = { name: "utils.ts", content: "export const x = 1;", language: "typescript" };
      await listeners["file-create"]({ roomId: testRoomId, file: newFile });

      expect(mockSocket.to).toHaveBeenCalledWith(testRoomId);
      expect(mockSocket.emit).toHaveBeenCalledWith("file-created", { file: newFile });
      expect(findOneAndUpdateSpy).toHaveBeenCalled();

      const files = crdtEngine.extractFilesFromDoc(crdtEngine.getRoomDoc(testRoomId).doc);
      expect(files.some((f) => f.name === "utils.ts")).toBe(true);
    });

    it("should delete file from CRDT doc and broadcast file-deleted", async () => {
      crdtEngine.getOrCreateRoomDoc(testRoomId, [
        { name: "main.ts", content: "", language: "typescript" },
        { name: "old.ts", content: "remove me", language: "typescript" },
      ]);

      await listeners["file-delete"]({ roomId: testRoomId, fileName: "old.ts" });

      expect(mockSocket.to).toHaveBeenCalledWith(testRoomId);
      expect(mockSocket.emit).toHaveBeenCalledWith("file-deleted", { fileName: "old.ts" });

      const files = crdtEngine.extractFilesFromDoc(crdtEngine.getRoomDoc(testRoomId).doc);
      expect(files.some((f) => f.name === "old.ts")).toBe(false);
    });
  });

  describe("files-change legacy fallback", () => {
    it("should broadcast files-update and update Room in DB", () => {
      const findOneAndUpdateSpy = jest.spyOn(Room, "findOneAndUpdate").mockReturnValue({
        catch: jest.fn(),
      });

      const updatedFiles = [{ name: "legacy.ts", content: "code" }];
      listeners["files-change"]({ files: updatedFiles });

      expect(mockSocket.to).toHaveBeenCalledWith(testRoomId);
      expect(mockSocket.emit).toHaveBeenCalledWith("files-update", { files: updatedFiles });
      expect(findOneAndUpdateSpy).toHaveBeenCalledWith({ roomId: testRoomId }, { files: updatedFiles });
    });
  });
});
