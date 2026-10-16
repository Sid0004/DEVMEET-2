import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import { app } from "../../../../app.js";
import { Room } from "../../room/room.model.js";
import { User } from "../../user/user.model.js";

describe("LiveKit Media API Integration Tests", () => {
  const mockUserId = "60d0fe4f5311236168a109ca";
  const mockUser = {
    _id: mockUserId,
    username: "devlead",
    fullName: "Dev Lead",
    email: "lead@devmeet.io",
    avatar: "https://avatar.test/lead.png",
  };

  const mockToken = jwt.sign(
    { _id: mockUserId, email: mockUser.email, username: mockUser.username },
    process.env.ACCESS_TOKEN_SECRET || "test-access-token-secret-key-123456789",
    { expiresIn: "1h" }
  );

  const mockRoom = {
    _id: "60d0fe4f5311236168a109cb",
    roomId: "media-test-room-101",
    roomName: "Engineering Standup",
    host: mockUserId,
    status: "active",
    participants: [mockUserId],
    roomSettings: { isLocked: false },
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/v1/media/:roomId/token", () => {
    test("rejects unauthenticated requests with 401 Unauthorized", async () => {
      const res = await request(app).post(`/api/v1/media/${mockRoom.roomId}/token`);
      expect(res.status).toBe(401);
    });

    test("returns 404 if the requested room does not exist", async () => {
      jest.spyOn(User, "findById").mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      jest.spyOn(Room, "findOne").mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/media/non-existent-room/token")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("Room not found");
    });

    test("returns 400 if the room session has been ended by host", async () => {
      jest.spyOn(User, "findById").mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      jest.spyOn(Room, "findOne").mockResolvedValue({
        ...mockRoom,
        status: "ended",
      });

      const res = await request(app)
        .post(`/api/v1/media/${mockRoom.roomId}/token`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("ended");
    });

    test("returns 200 with LiveKit token, url, and identity for valid participant", async () => {
      jest.spyOn(User, "findById").mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      jest.spyOn(Room, "findOne").mockResolvedValue(mockRoom);

      const res = await request(app)
        .post(`/api/v1/media/${mockRoom.roomId}/token`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.url).toBeDefined();
      expect(res.body.data.roomId).toBe(mockRoom.roomId);
      expect(res.body.data.identity).toBe(mockUserId);

      // Verify the generated token decodes properly
      const decoded = jwt.decode(res.body.data.token);
      expect(decoded.sub).toBe(mockUserId);
      expect(decoded.video.room).toBe(mockRoom.roomId);
    });

    test("returns 200 via the alias route /api/v1/rooms/:roomId/media-token", async () => {
      jest.spyOn(User, "findById").mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      jest.spyOn(Room, "findOne").mockResolvedValue(mockRoom);

      const res = await request(app)
        .post(`/api/v1/rooms/${mockRoom.roomId}/media-token`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });
  });
});
