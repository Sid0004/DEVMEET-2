import { Router } from "express";
import { createRoom, getRoomById, joinRoom, leaveRoom } from "../controllers/room.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to all room routes
router.use(verifyJWT);

router.route("/create").post(createRoom);
router.route("/:roomId").get(getRoomById);
router.route("/:roomId/join").post(joinRoom);
router.route("/:roomId/leave").post(leaveRoom);

export default router;
