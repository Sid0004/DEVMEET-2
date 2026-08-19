import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import { app } from "../../../../app.js";
import UserService from "../user.service.js";
import { User } from "../user.model.js";
import { ApiError } from "../../../utils/ApiError.js";

describe("User & Authentication API Automation Tests", () => {
    const mockUserId = "65f1a2b3c4d5e6f7a8b9c0d1";
    const mockUser = {
        _id: mockUserId,
        username: "testuser",
        email: "testuser@example.com",
        fullName: "Test User",
        profession: "Developer",
        accountType: "individual",
        avatar: "https://api.dicebear.com/7.x/dylan/svg?seed=testuser",
        isOnboarded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const mockAccessToken = jwt.sign(
        {
            _id: mockUserId,
            email: mockUser.email,
            username: mockUser.username,
            fullName: mockUser.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
    );

    const mockRefreshToken = jwt.sign(
        { _id: mockUserId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    // ==========================================
    // 1. REGISTRATION ENDPOINT TESTS (/register)
    // ==========================================
    describe("POST /api/v1/users/register", () => {
        it("should reject registration when required fields are missing", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({
                    username: "",
                    email: "test@example.com",
                    password: "Password123",
                    fullName: ""
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/All required fields must be filled/i);
        });

        it("should reject registration with invalid email format", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({
                    username: "validuser",
                    email: "invalid-email-address",
                    password: "Password123",
                    fullName: "Valid User"
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/valid email/i);
        });

        it("should reject registration with invalid username format", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({
                    username: "ab", // Too short (< 3 chars)
                    email: "valid@example.com",
                    password: "Password123",
                    fullName: "Valid User"
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/3-30 characters/i);
        });

        it("should reject registration if password is shorter than 8 chars or lacks a number", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({
                    username: "validuser",
                    email: "valid@example.com",
                    password: "short",
                    fullName: "Valid User"
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/at least 8 characters/i);
        });

        it("should reject organization account registration if organizationName is missing", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({
                    username: "orgadmin",
                    email: "orgadmin@example.com",
                    password: "Password123",
                    fullName: "Org Admin",
                    accountType: "organization"
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Organization name is required/i);
        });

        it("should successfully register a new user with valid data", async () => {
            jest.spyOn(UserService, "registerUser").mockResolvedValue(mockUser);

            const payload = {
                username: "newuser",
                email: "newuser@example.com",
                password: "SecurePassword123",
                fullName: "New User"
            };

            const res = await request(app)
                .post("/api/v1/users/register")
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.username).toBe(mockUser.username);
            expect(res.body.data.email).toBe(mockUser.email);
            expect(UserService.registerUser).toHaveBeenCalledWith(expect.objectContaining({
                username: payload.username,
                email: payload.email,
                fullName: payload.fullName
            }));
        });

        it("should handle 409 Conflict if user already exists", async () => {
            jest.spyOn(UserService, "registerUser").mockRejectedValue(
                new ApiError(409, "User with this email or username already exists")
            );

            const res = await request(app)
                .post("/api/v1/users/register")
                .send({
                    username: "existinguser",
                    email: "existing@example.com",
                    password: "Password123",
                    fullName: "Existing User"
                });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/already exists/i);
        });
    });

    // ==========================================
    // 2. LOGIN ENDPOINT TESTS (/login)
    // ==========================================
    describe("POST /api/v1/users/login", () => {
        it("should reject login if credentials are missing", async () => {
            const res = await request(app)
                .post("/api/v1/users/login")
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Username or email is required/i);
        });

        it("should successfully login with valid credentials and return tokens & cookies", async () => {
            jest.spyOn(UserService, "loginUser").mockResolvedValue({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken,
                loggedInUser: mockUser
            });

            const res = await request(app)
                .post("/api/v1/users/login")
                .send({
                    identifier: "testuser@example.com",
                    password: "Password123"
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBe(mockAccessToken);
            expect(res.body.data.refreshToken).toBe(mockRefreshToken);
            expect(res.body.data.user.email).toBe(mockUser.email);

            // Verify cookies are set in headers
            const cookies = res.headers["set-cookie"];
            expect(cookies).toBeDefined();
            expect(cookies.some((c) => c.includes("accessToken="))).toBe(true);
            expect(cookies.some((c) => c.includes("refreshToken="))).toBe(true);
        });

        it("should return 401 when invalid credentials are provided", async () => {
            jest.spyOn(UserService, "loginUser").mockRejectedValue(
                new ApiError(401, "Invalid email/username or password")
            );

            const res = await request(app)
                .post("/api/v1/users/login")
                .send({
                    identifier: "wronguser@example.com",
                    password: "WrongPassword123"
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Invalid email\/username or password/i);
        });
    });

    // ==========================================
    // 3. GOOGLE LOGIN TESTS (/google-login)
    // ==========================================
    describe("POST /api/v1/users/google-login", () => {
        it("should reject request if Google token is missing", async () => {
            const res = await request(app)
                .post("/api/v1/users/google-login")
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Google authentication token is required/i);
        });

        it("should login user successfully with valid Google token and return cookies & tokens", async () => {
            const googleUser = {
                ...mockUser,
                authProvider: "google",
                googleId: "google-oauth2-sub-12345"
            };

            jest.spyOn(UserService, "googleLogin").mockResolvedValue({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken,
                loggedInUser: googleUser
            });

            const res = await request(app)
                .post("/api/v1/users/google-login")
                .send({ credential: "mock-google-id-token-xyz" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBe(mockAccessToken);
            expect(res.body.data.refreshToken).toBe(mockRefreshToken);
            expect(res.body.data.user.email).toBe(googleUser.email);
            expect(res.body.data.user.authProvider).toBe("google");

            // Verify cookies
            const cookies = res.headers["set-cookie"];
            expect(cookies).toBeDefined();
            expect(cookies.some((c) => c.includes("accessToken="))).toBe(true);
        });

        it("should return 401 if Google token is invalid", async () => {
            jest.spyOn(UserService, "googleLogin").mockRejectedValue(
                new ApiError(401, "Google verification failed: Invalid token")
            );

            const res = await request(app)
                .post("/api/v1/users/google-login")
                .send({ token: "invalid-google-token" });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Google verification failed/i);
        });
    });

    // ==========================================
    // 4. GITHUB LOGIN TESTS (/github-login)
    // ==========================================
    describe("POST /api/v1/users/github-login", () => {
        it("should reject request if GitHub code is missing", async () => {
            const res = await request(app)
                .post("/api/v1/users/github-login")
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/GitHub authorization code is required/i);
        });

        it("should login user successfully with valid GitHub code and return cookies & tokens", async () => {
            const githubUser = {
                ...mockUser,
                authProvider: "github",
                githubId: "98765432"
            };

            jest.spyOn(UserService, "githubLogin").mockResolvedValue({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken,
                loggedInUser: githubUser
            });

            const res = await request(app)
                .post("/api/v1/users/github-login")
                .send({ code: "valid-github-oauth-code-123" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBe(mockAccessToken);
            expect(res.body.data.refreshToken).toBe(mockRefreshToken);
            expect(res.body.data.user.email).toBe(githubUser.email);
            expect(res.body.data.user.authProvider).toBe("github");

            // Verify cookies
            const cookies = res.headers["set-cookie"];
            expect(cookies).toBeDefined();
            expect(cookies.some((c) => c.includes("accessToken="))).toBe(true);
        });

        it("should return 401 if GitHub code exchange fails", async () => {
            jest.spyOn(UserService, "githubLogin").mockRejectedValue(
                new ApiError(401, "GitHub authentication failed: bad_verification_code")
            );

            const res = await request(app)
                .post("/api/v1/users/github-login")
                .send({ code: "invalid-or-expired-code" });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/GitHub authentication failed/i);
        });
    });

    // ==========================================
    // 5. REFRESH TOKEN TESTS (/refresh-token)
    // ==========================================
    describe("POST /api/v1/users/refresh-token", () => {
        it("should return 401 if refresh token is missing", async () => {
            const res = await request(app)
                .post("/api/v1/users/refresh-token")
                .send({});

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Refresh token is required/i);
        });

        it("should refresh tokens successfully when valid refresh token is passed in body", async () => {
            const newAccessToken = "new-access-token-12345";
            const newRefreshToken = "new-refresh-token-12345";

            jest.spyOn(UserService, "refreshAccessToken").mockResolvedValue({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });

            const res = await request(app)
                .post("/api/v1/users/refresh-token")
                .send({ refreshToken: mockRefreshToken });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBe(newAccessToken);
            expect(res.body.data.refreshToken).toBe(newRefreshToken);
        });

        it("should refresh tokens successfully when passed via cookie", async () => {
            const newAccessToken = "new-access-token-from-cookie";
            const newRefreshToken = "new-refresh-token-from-cookie";

            jest.spyOn(UserService, "refreshAccessToken").mockResolvedValue({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });

            const res = await request(app)
                .post("/api/v1/users/refresh-token")
                .set("Cookie", [`refreshToken=${mockRefreshToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBe(newAccessToken);
        });
    });

    // ==========================================
    // 4. PROTECTED ROUTES TESTS (verifyJWT middleware)
    // ==========================================
    describe("Protected Routes (/current-user, /logout, /change-password)", () => {
        const mockFindByIdQuery = {
            select: jest.fn().mockResolvedValue(mockUser)
        };

        describe("GET /api/v1/users/current-user", () => {
            it("should reject request without authentication token with 401", async () => {
                const res = await request(app).get("/api/v1/users/current-user");

                expect(res.status).toBe(401);
                expect(res.body.success).toBe(false);
            });

            it("should reject request with invalid bearer token", async () => {
                const res = await request(app)
                    .get("/api/v1/users/current-user")
                    .set("Authorization", "Bearer invalid-token-xyz");

                expect(res.status).toBe(401);
                expect(res.body.success).toBe(false);
            });

            it("should return current user when valid Bearer token is provided", async () => {
                jest.spyOn(User, "findById").mockReturnValue(mockFindByIdQuery);
                jest.spyOn(UserService, "getCurrentUser").mockResolvedValue(mockUser);

                const res = await request(app)
                    .get("/api/v1/users/current-user")
                    .set("Authorization", `Bearer ${mockAccessToken}`);

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.data.username).toBe(mockUser.username);
                expect(res.body.data.email).toBe(mockUser.email);
            });
        });

        describe("POST /api/v1/users/logout", () => {
            it("should successfully log out and clear cookies for authenticated user", async () => {
                jest.spyOn(User, "findById").mockReturnValue(mockFindByIdQuery);
                jest.spyOn(UserService, "logoutUser").mockResolvedValue(true);

                const res = await request(app)
                    .post("/api/v1/users/logout")
                    .set("Authorization", `Bearer ${mockAccessToken}`);

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toMatch(/logged out/i);
            });
        });

        describe("POST /api/v1/users/change-password", () => {
            it("should reject password change if old or new password is missing", async () => {
                jest.spyOn(User, "findById").mockReturnValue(mockFindByIdQuery);

                const res = await request(app)
                    .post("/api/v1/users/change-password")
                    .set("Authorization", `Bearer ${mockAccessToken}`)
                    .send({ oldPassword: "OldPassword123" });

                expect(res.status).toBe(400);
                expect(res.body.message).toMatch(/required/i);
            });

            it("should change password successfully when valid passwords are provided", async () => {
                jest.spyOn(User, "findById").mockReturnValue(mockFindByIdQuery);
                jest.spyOn(UserService, "changePassword").mockResolvedValue(true);

                const res = await request(app)
                    .post("/api/v1/users/change-password")
                    .set("Authorization", `Bearer ${mockAccessToken}`)
                    .send({
                        oldPassword: "OldPassword123",
                        newPassword: "NewSecurePassword456"
                    });

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toMatch(/Password changed successfully/i);
            });
        });
    });
});
