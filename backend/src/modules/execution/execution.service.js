import { spawn } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the sandbox temp directory and the local tsx CLI
const SANDBOX_DIR = path.resolve(__dirname, "../../../temp/sandbox");
const TSX_CLI_PATH = path.resolve(__dirname, "../../../node_modules/tsx/dist/cli.mjs");

// Ensure the sandbox directory exists at startup
if (!fsSync.existsSync(SANDBOX_DIR)) {
  fsSync.mkdirSync(SANDBOX_DIR, { recursive: true });
}

export class CodeExecutionEngine {
  /**
   * Supported language configurations with file extensions and execution commands
   */
  static getLanguageConfig(language = "") {
    const lang = language.trim().toLowerCase();
    const nodeExecutable = process.execPath; // Guarantees active Node binary on any OS

    switch (lang) {
      case "javascript":
      case "js":
      case "node":
        return {
          normalizedLang: "javascript",
          extension: "js",
          command: nodeExecutable,
          getArgs: (filePath) => [filePath],
        };

      case "typescript":
      case "ts":
        return {
          normalizedLang: "typescript",
          extension: "ts",
          command: nodeExecutable,
          getArgs: (filePath) => [TSX_CLI_PATH, filePath],
        };

      case "python":
      case "python3":
      case "py":
        return {
          normalizedLang: "python",
          extension: "py",
          command: process.platform === "win32" ? "python" : "python3",
          getArgs: (filePath) => ["-u", filePath], // unbuffered stdio
        };

      case "go":
        return {
          normalizedLang: "go",
          extension: "go",
          command: "go",
          getArgs: (filePath) => ["run", filePath],
        };

      default:
        throw new Error(
          `Language "${language}" is not currently supported for sandboxed execution. Supported languages: JavaScript, TypeScript, Python, Go.`
        );
    }
  }

  /**
   * Executes source code inside an isolated sandbox with resource controls and timeouts
   *
   * @param {Object} options
   * @param {string} options.code - Source code string to execute
   * @param {string} options.language - Target language (js, ts, py, go)
   * @param {string} [options.stdin=""] - Optional standard input to pipe to the process
   * @param {number} [options.timeoutMs=7000] - Hard execution timeout in milliseconds
   * @returns {Promise<{ stdout: string, stderr: string, exitCode: number, executionTimeMs: number, language: string }>}
   */
  static async execute({ code, language, stdin = "", timeoutMs = 7000 }) {
    if (!code || typeof code !== "string" || !code.trim()) {
      throw new Error("No source code provided for execution");
    }

    const config = this.getLanguageConfig(language);
    const uniqueId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const tempFilePath = path.join(SANDBOX_DIR, `${uniqueId}.${config.extension}`);

    // 1. Write the code to our sandbox file
    await fs.writeFile(tempFilePath, code, "utf8");

    const startTime = Date.now();
    let stdoutBuffer = "";
    let stderrBuffer = "";
    let exitCode = 0;
    let killedByTimeout = false;
    const maxBufferLength = 512 * 1024; // 512KB output cap

    try {
      const args = config.getArgs(tempFilePath);

      // Spawn directly without shell to prevent command-injection vulnerabilities & Windows quoting bugs
      const child = spawn(config.command, args, {
        cwd: SANDBOX_DIR,
        timeout: timeoutMs,
        windowsHide: true,
        env: {
          ...process.env,
          NODE_ENV: "production",
          PYTHONDONTWRITEBYTECODE: "1",
        },
      });

      // Handle standard input if provided
      if (stdin && child.stdin) {
        child.stdin.write(stdin);
        child.stdin.end();
      }

      // Buffer stdout
      child.stdout?.on("data", (chunk) => {
        if (stdoutBuffer.length < maxBufferLength) {
          stdoutBuffer += chunk.toString("utf8");
        } else if (!stdoutBuffer.endsWith("\n[Output Truncated: Exceeded 512KB Limit]")) {
          stdoutBuffer += "\n[Output Truncated: Exceeded 512KB Limit]";
        }
      });

      // Buffer stderr
      child.stderr?.on("data", (chunk) => {
        if (stderrBuffer.length < maxBufferLength) {
          stderrBuffer += chunk.toString("utf8");
        }
      });

      // Timeout watchdog
      const timer = setTimeout(() => {
        killedByTimeout = true;
        try {
          child.kill("SIGKILL");
        } catch {}
      }, timeoutMs);

      // Await process termination
      exitCode = await new Promise((resolve) => {
        child.on("error", (err) => {
          clearTimeout(timer);
          stderrBuffer += `\nProcess execution error: ${err.message}`;
          resolve(1);
        });

        child.on("close", (code, signal) => {
          clearTimeout(timer);
          if (killedByTimeout || signal === "SIGKILL" || signal === "SIGTERM") {
            stderrBuffer += `\nExecution timed out after ${timeoutMs}ms (Process killed).`;
            resolve(-1);
          } else {
            resolve(code !== null ? code : 1);
          }
        });
      });
    } finally {
      // 2. Guaranteed file cleanup
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupErr) {
        // Silently ignore if already unlinked
      }
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      stdout: stdoutBuffer,
      stderr: stderrBuffer,
      exitCode,
      executionTimeMs,
      language: config.normalizedLang,
    };
  }
}
