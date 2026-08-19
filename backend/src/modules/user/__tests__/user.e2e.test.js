import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../../../app.js";
import { User } from "../user.model.js";

describe("User & Auth End-to-End (E2E) Integration Tests (Real Database)", () => {
    let isConnected = false;
    const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const testUsername = `e2e_user_${uniqueSuffix}`;
    const testEmail = `e2e_${uniqueSuffix}@example.com`;
    const testPassword = "Password123!";
    const testFullName = "E2E Test User";

    let accessToken = "";
    let refreshToken = "";
    let createdUserId = "";

    beforeAll(async () => {
        const rawUri = process.env.MONGODB_URI || process.env.MONGO_DB_URI;
        if (!rawUri) {
            console.warn("No MONGODB_URI found, skipping E2E database tests");
            return;
        }

        // Safe database separation: Connect to dedicated 'devmeet_test_automation' DB
        let testUri = rawUri;
        if (testUri.includes("/devmeet_v2")) {
            testUri = testUri.replace("/devmeet_v2", "/devmeet_test_automation");
        } else if (testUri.includes("/devmeet") && !testUri.includes("devmeet_test_automation")) {
            testUri = testUri.replace("/devmeet", "/devmeet_test_automation");
        }

        try {
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(testUri, { serverSelectionTimeoutMS: 5000 });
            }
            isConnected = mongoose.connection.readyState === 1;
        } catch (err) {
            console.warn("MongoDB connection failed in E2E tests, skipping DB assertions:", err.message);
            isConnected = false;
        }
    }, 15000);

    afterAll(async () => {
        // Safe cleanup: Delete test users created during this test suite and close connection
        if (isConnected && mongoose.connection.readyState !== 0) {
            try {
                await User.deleteMany({ email: { $regex: /@example\.com$/i } });
            } catch (err) {
                console.error("Cleanup error:", err);
            } finally {
                await mongoose.disconnect();
            }
        }
    }, 10000);

    it("Step 1: Should physically register a user and store hashed password in MongoDB", async () => {
        if (!isConnected) return;

        const res = await request(app)
            .post("/api/v1/users/register")
            .send({
                username: testUsername,
                email: testEmail,
                password: testPassword,
                fullName: testFullName
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.username).toBe(testUsername.toLowerCase());
        expect(res.body.data.email).toBe(testEmail.toLowerCase());
        createdUserId = res.body.data._id;

        // Verify directly in MongoDB that user exists and password is NOT plaintext
        const dbUser = await User.findById(createdUserId);
        expect(dbUser).not.toBeNull();
        expect(dbUser.password).not.toBe(testPassword);
        expect(dbUser.password.startsWith("$2")).toBe(true); // bcrypt hash format
    });

    it("Step 2: Should reject duplicate user registration at the database level", async () => {
        if (!isConnected) return;

        const res = await request(app)
            .post("/api/v1/users/register")
            .send({
                username: testUsername,
                email: testEmail,
                password: testPassword,
                fullName: testFullName
            });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });

    it("Step 3: Should reject login with wrong password via real bcrypt comparison", async () => {
        if (!isConnected) return;

        const res = await request(app)
            .post("/api/v1/users/login")
            .send({
                identifier: testEmail,
                password: "WrongPassword999!"
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("Step 4: Should login successfully with correct password and store real refreshToken in DB", async () => {
        if (!isConnected) return;

        const res = await request(app)
            .post("/api/v1/users/login")
            .send({
                identifier: testEmail,
                password: testPassword
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
        expect(res.body.data).toHaveProperty("accessToken");
        expect(res.body.data).toHaveProperty("refreshToken");

        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;

        // Verify in DB that refreshToken was physically stored
        const dbUser = await User.findById(createdUserId);
        expect(dbUser.refreshToken).toBe(refreshToken);
    });

    it("Step 5: Should access protected /current-user using the real accessToken", async () => {
        if (!isConnected) return;

        const res = await request(app)
            .get("/api/v1/users/current-user")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(createdUserId);
        expect(res.body.data.email).toBe(testEmail.toLowerCase());
        expect(res.body.data.password).toBeUndefined();
    });

    it("Step 6: Should refresh tokens using real refreshToken", async () => {
        if (!isConnected) return;

        const res = await request(app)
            .post("/api/v1/users/refresh-token")
            .send({ refreshToken });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("accessToken");
        expect(res.body.data).toHaveProperty("refreshToken");

        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
    });

    it("Step 7: Should log out and clear the refreshToken in DB", async () => {
        if (!isConnected) return;

        const res = await request(app)
            .post("/api/v1/users/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify in DB that refreshToken is cleared
        const dbUser = await User.findById(createdUserId);
        expect(dbUser.refreshToken).toBeFalsy();
    });
});
