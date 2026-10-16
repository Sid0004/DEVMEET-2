import { Router } from "express";
import { runCode } from "./execution.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Secure code execution endpoint (authenticated users and active guest sessions)
router.use(verifyJWT);
router.route("/run").post(runCode);

export default router;
