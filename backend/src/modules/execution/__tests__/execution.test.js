import { CodeExecutionEngine } from "../execution.service.js";
import request from "supertest";
import { app } from "../../../../app.js";
import jwt from "jsonwebtoken";

describe("Code Execution Engine Test Suite", () => {
  const originalEnv = process.env.ENABLE_CODE_EXECUTION;

  beforeAll(() => {
    process.env.ENABLE_CODE_EXECUTION = "true";
  });

  afterAll(() => {
    process.env.ENABLE_CODE_EXECUTION = originalEnv;
  });

  describe("Engine Unit Tests", () => {
    it("should execute JavaScript code and return clean stdout and exitCode 0", async () => {
      const result = await CodeExecutionEngine.execute({
        code: `
          const a = 15;
          const b = 27;
          console.log("SUM:", a + b);
        `,
        language: "javascript",
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("SUM: 42");
      expect(result.stderr).toBe("");
      expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.language).toBe("javascript");
    });

    it("should execute TypeScript code with type annotations and modern syntax", async () => {
      const result = await CodeExecutionEngine.execute({
        code: `
          interface Developer {
            name: string;
            skills: string[];
          }
          const dev: Developer = { name: "Ada Lovelace", skills: ["Algorithms", "Math"] };
          console.log(\`Dev: \${dev.name}, Skills: \${dev.skills.length}\`);
        `,
        language: "typescript",
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Dev: Ada Lovelace, Skills: 2");
      expect(result.language).toBe("typescript");
    });

    it("should execute Python code and capture standard output", async () => {
      const result = await CodeExecutionEngine.execute({
        code: `
nums = [x * 2 for x in range(5)]
print("DOUBLED:", nums)
`,
        language: "python",
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("DOUBLED: [0, 2, 4, 6, 8]");
      expect(result.language).toBe("python");
    });

    it("should capture syntax errors in stderr and return non-zero exitCode", async () => {
      const result = await CodeExecutionEngine.execute({
        code: `const invalid syntax = ;;;`,
        language: "javascript",
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toBeTruthy();
    });

    it("should terminate infinite loops cleanly when execution timeout is reached", async () => {
      const result = await CodeExecutionEngine.execute({
        code: `while(true) {}`,
        language: "javascript",
        timeoutMs: 1200,
      });

      expect(result.exitCode).toBe(-1);
      expect(result.stderr).toContain("timed out");
    }, 10000);

    it("should throw a descriptive error when language is unsupported", async () => {
      await expect(
        CodeExecutionEngine.execute({
          code: "SELECT 1;",
          language: "sql-unsupported",
        })
      ).rejects.toThrow(/not currently supported/i);
    });

    it("should throw an error when code is empty", async () => {
      await expect(
        CodeExecutionEngine.execute({
          code: "   ",
          language: "javascript",
        })
      ).rejects.toThrow(/no source code provided/i);
    });
  });

  describe("HTTP API Tests (/api/v1/rooms/run & /api/v1/execution/run)", () => {
    let guestToken;

    beforeAll(() => {
      guestToken = jwt.sign(
        {
          _id: "660000000000000000000099",
          fullName: "Code Tester Guest",
          username: "guest_tester",
          isGuest: true,
          roomId: "999888",
          role: "guest",
        },
        process.env.ACCESS_TOKEN_SECRET || "default_secret",
        { expiresIn: "1h" }
      );
    });

    it("should reject unauthenticated execution requests with 401", async () => {
      const res = await request(app)
        .post("/api/v1/rooms/run")
        .send({ code: 'console.log("unauth");', language: "javascript" });

      expect(res.status).toBe(401);
    });

    it("should execute code successfully via /api/v1/rooms/run for guests", async () => {
      const res = await request(app)
        .post("/api/v1/rooms/run")
        .set("Authorization", `Bearer ${guestToken}`)
        .send({
          code: 'console.log("Guest Runner Verified!");',
          language: "javascript",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stdout).toContain("Guest Runner Verified!");
      expect(res.body.data.exitCode).toBe(0);
    });

    it("should execute code successfully via /api/v1/execution/run", async () => {
      const res = await request(app)
        .post("/api/v1/execution/run")
        .set("Authorization", `Bearer ${guestToken}`)
        .send({
          code: 'const greeting: string = "Direct API OK"; console.log(greeting);',
          language: "typescript",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stdout).toContain("Direct API OK");
      expect(res.body.data.exitCode).toBe(0);
    });
  });
});
