import { generateLiveKitToken, getLiveKitUrl } from "../livekit.service.js";
import jwt from "jsonwebtoken";

describe("LiveKit Media Service Unit Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      LIVEKIT_API_KEY: "test_devkey",
      LIVEKIT_API_SECRET: "test_secret_must_be_long_enough_for_signing_12345",
      LIVEKIT_URL: "ws://localhost:7880",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getLiveKitUrl", () => {
    test("returns configured LIVEKIT_URL", () => {
      expect(getLiveKitUrl()).toBe("ws://localhost:7880");
    });

    test("falls back to ws://localhost:7880 if LIVEKIT_URL is undefined", () => {
      delete process.env.LIVEKIT_URL;
      expect(getLiveKitUrl()).toBe("ws://localhost:7880");
    });
  });

  describe("generateLiveKitToken", () => {
    const mockUser = {
      _id: "60d0fe4f5311236168a109ca",
      fullName: "Ada Lovelace",
      username: "adalovelace",
      avatar: "https://avatar.test/ada.png",
      isGuest: false,
    };

    test("throws an error if roomId is missing", async () => {
      await expect(
        generateLiveKitToken({ roomId: "", user: mockUser })
      ).rejects.toThrow("Room ID is required");
    });

    test("throws an error if user is missing or has no _id", async () => {
      await expect(
        generateLiveKitToken({ roomId: "dev-room-101", user: null })
      ).rejects.toThrow("User identity is required");

      await expect(
        generateLiveKitToken({ roomId: "dev-room-101", user: {} })
      ).rejects.toThrow("User identity is required");
    });

    test("generates a valid signed JWT for a regular participant", async () => {
      const token = await generateLiveKitToken({
        roomId: "room-abc-123",
        user: mockUser,
        isHost: false,
      });

      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // Standard JWT format: header.payload.signature

      const decoded = jwt.decode(token);
      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe(mockUser._id);
      expect(decoded.name).toBe("Ada Lovelace");
      expect(decoded.video).toBeDefined();
      expect(decoded.video.room).toBe("room-abc-123");
      expect(decoded.video.roomJoin).toBe(true);
      expect(decoded.video.canPublish).toBe(true);
      expect(decoded.video.canSubscribe).toBe(true);
      expect(decoded.video.roomAdmin).toBe(false);

      const metadata = JSON.parse(decoded.metadata);
      expect(metadata.isGuest).toBe(false);
      expect(metadata.role).toBe("participant");
      expect(metadata.avatar).toBe("https://avatar.test/ada.png");
    });

    test("assigns roomAdmin=true when user is host", async () => {
      const token = await generateLiveKitToken({
        roomId: "room-host-999",
        user: mockUser,
        isHost: true,
      });

      const decoded = jwt.decode(token);
      expect(decoded.video.roomAdmin).toBe(true);

      const metadata = JSON.parse(decoded.metadata);
      expect(metadata.role).toBe("host");
    });

    test("handles guest users seamlessly with fallback identity", async () => {
      const guestUser = {
        _id: "guest_60d0fe4f5311236168a109cb",
        fullName: "Guest Alan",
        isGuest: true,
      };

      const token = await generateLiveKitToken({
        roomId: "room-guest-session",
        user: guestUser,
        isHost: false,
      });

      const decoded = jwt.decode(token);
      expect(decoded.sub).toBe("guest_60d0fe4f5311236168a109cb");
      expect(decoded.name).toBe("Guest Alan");

      const metadata = JSON.parse(decoded.metadata);
      expect(metadata.isGuest).toBe(true);
      expect(metadata.role).toBe("participant");
    });

    test("respects custom permission overrides", async () => {
      const token = await generateLiveKitToken({
        roomId: "viewer-only-room",
        user: mockUser,
        isHost: false,
        permissions: {
          canPublish: false,
          canSubscribe: true,
          canPublishData: false,
        },
      });

      const decoded = jwt.decode(token);
      expect(decoded.video.canPublish).toBe(false);
      expect(decoded.video.canSubscribe).toBe(true);
      expect(decoded.video.canPublishData).toBe(false);
    });
  });
});
