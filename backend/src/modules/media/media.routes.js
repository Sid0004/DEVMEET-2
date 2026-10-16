import { Router } from "express";
import { getMediaToken } from "./media.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Endpoint for participants to fetch their LiveKit SFU connection token
router.route("/:roomId/token").post(verifyJWT, getMediaToken);

export default router;
