import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import { app } from "../../../../app.js";
import { Room } from "../room.model.js";
import { User } from "../../user/user.model.js";

describe("Room API & Guest Join Automation Tests", () => {
    const mockHostId = "65f1a2b3c4d5e6f7a8b9c0d1";
    const mockRoomId = "devmeet_room_test_123";

    const mockHost = {
        _id: mockHostId,
        username: "hostdev",
        fullName: "Lead Host",
        avatar: "https://api.dicebear.com/7.x/dylan/svg?seed=hostdev",
    };

    const mockActiveRoom = {
        _id: "65f1a2b3c4d5e6f7a8b9c0f9",
        roomId: mockRoomId,
        roomName: "Architecture Review",
        description: "Reviewing system architecture",
        status: "active",
        roomType: "public",
        host: mockHost,
        participants: [mockHostId],
        roomSettings: { isLocked: false },
        organization: null,
        files: [],
        whiteboardData: "[]",
        createdAt: new Date().toISOString(),
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    // ==========================================
    // 1. PUBLIC ROOM INFO ENDPOINT (/public-info)
    // ==========================================
    describe("GET /api/v1/rooms/:roomId/public-info", () => {
        it("should return public room details when room exists", async () => {
            jest.spyOn(Room, "findOne").mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockActiveRoom),
                }),
            });

            const res = await request(app).get(`/api/v1/rooms/${mockRoomId}/public-info`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.roomId).toBe(mockRoomId);
            expect(res.body.data.roomName).toBe("Architecture Review");
            expect(res.body.data.isLocked).toBe(false);
            expect(res.body.data.host.fullName).toBe("Lead Host");
        });

        it("should return 404 if room does not exist", async () => {
            jest.spyOn(Room, "findOne").mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null),
                }),
            });

            const res = await request(app).get(`/api/v1/rooms/non_existent_room/public-info`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("Room not found");
        });
    });

    // ==========================================
    // 2. GUEST JOIN ENDPOINT (/guest-join)
    // ==========================================
    describe("POST /api/v1/rooms/:roomId/guest-join", () => {
        it("should reject guest join if name is missing or empty", async () => {
            const res = await request(app)
                .post(`/api/v1/rooms/${mockRoomId}/guest-join`)
                .send({ name: "" });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("Please provide your name to join as a guest");
        });

        it("should reject guest join if room does not exist", async () => {
            jest.spyOn(Room, "findOne").mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            const res = await request(app)
                .post(`/api/v1/rooms/missing_room_404/guest-join`)
                .send({ name: "Alice Guest" });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("Room with this ID does not exist");
        });

        it("should reject guest join if room status is ended", async () => {
            jest.spyOn(Room, "findOne").mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    ...mockActiveRoom,
                    status: "ended",
                }),
            });

            const res = await request(app)
                .post(`/api/v1/rooms/${mockRoomId}/guest-join`)
                .send({ name: "Alice Guest" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("This session has ended");
        });

        it("should reject guest join if room is locked by the host", async () => {
            jest.spyOn(Room, "findOne").mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    ...mockActiveRoom,
                    roomSettings: { isLocked: true },
                }),
            });

            const res = await request(app)
                .post(`/api/v1/rooms/${mockRoomId}/guest-join`)
                .send({ name: "Alice Guest" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("This room is currently locked");
        });

        it("should reject guest join if room belongs to an organization", async () => {
            jest.spyOn(Room, "findOne").mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    ...mockActiveRoom,
                    organization: "65f1a2b3c4d5e6f7a8b9c0aa",
                }),
            });

            const res = await request(app)
                .post(`/api/v1/rooms/${mockRoomId}/guest-join`)
                .send({ name: "Alice Guest" });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("Organization rooms require a verified team account");
        });

        it("should issue an ephemeral guest token and grant access on valid request", async () => {
            jest.spyOn(Room, "findOne").mockReturnValue({
                select: jest.fn().mockResolvedValue(mockActiveRoom),
            });

            const res = await request(app)
                .post(`/api/v1/rooms/${mockRoomId}/guest-join`)
                .send({ name: "Alice Guest" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.fullName).toBe("Alice Guest");
            expect(res.body.data.user.isGuest).toBe(true);
            expect(res.body.data.user.roomId).toBe(mockRoomId);
            expect(res.body.data).toHaveProperty("accessToken");

            // Verify the signed JWT payload
            const decoded = jwt.verify(res.body.data.accessToken, process.env.ACCESS_TOKEN_SECRET);
            expect(decoded.isGuest).toBe(true);
            expect(decoded.fullName).toBe("Alice Guest");
            expect(decoded.roomId).toBe(mockRoomId);
            expect(decoded.role).toBe("guest");

            // Verify cookie is set
            expect(res.headers["set-cookie"]).toBeDefined();
        });
    });

    // ==========================================
    // 3. GUEST ACCESS TO PROTECTED ROOM ROUTES
    // ==========================================
    describe("Protected Room Endpoints with Guest Access Token", () => {
        it("should allow a valid guest token to read room details without requiring User record in DB", async () => {
            const guestToken = jwt.sign(
                {
                    _id: "65f1a2b3c4d5e6f7a8b9c999",
                    fullName: "Guest Developer",
                    username: "guest_developer",
                    avatar: "https://api.dicebear.com/7.x/dylan/svg?seed=guest",
                    isGuest: true,
                    roomId: mockRoomId,
                    role: "guest",
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "6h" }
            );

            // Mock User.findById should NOT be called for guest
            const userSpy = jest.spyOn(User, "findById");
            jest.spyOn(Room, "findOne").mockResolvedValue(mockActiveRoom);

            const res = await request(app)
                .get(`/api/v1/rooms/${mockRoomId}`)
                .set("Authorization", `Bearer ${guestToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.roomId).toBe(mockRoomId);
            expect(userSpy).not.toHaveBeenCalled();
        });
    });
});
