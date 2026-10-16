import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { CodeExecutionEngine } from "./execution.service.js";

/**
 * Controller to execute arbitrary source code in a sandboxed runtime
 */
export const runCode = asyncHandler(async (req, res) => {
  if (process.env.ENABLE_CODE_EXECUTION !== "true") {
    throw new ApiError(403, "Code execution feature is disabled on this server.");
  }

  const { code, language, stdin, timeoutMs } = req.body;

  if (!code || typeof code !== "string" || !code.trim()) {
    throw new ApiError(400, "Code is required for execution.");
  }

  try {
    const result = await CodeExecutionEngine.execute({
      code,
      language: language || "javascript",
      stdin: stdin || "",
      timeoutMs: timeoutMs && timeoutMs > 0 && timeoutMs <= 15000 ? timeoutMs : 7000,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        result,
        result.exitCode === 0 ? "Code executed successfully" : "Execution completed with errors"
      )
    );
  } catch (err) {
    if (err.message && err.message.includes("not currently supported")) {
      throw new ApiError(400, err.message);
    }
    throw new ApiError(500, `Execution engine error: ${err.message}`);
  }
});
