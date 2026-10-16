import { Router } from "express";
import { 
    createRoom, 
    getRoomById, 
    joinRoom, 
    leaveRoom, 
    endRoom, 
    runCode, 
    getAllRoomsById, 
    deleteRoom,
    getRoomPublicInfo,
    guestJoinRoom
} from "./room.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public routes for guest access and pre-join room previews
router.route("/:roomId/public-info").get(getRoomPublicInfo);
router.route("/:roomId/guest-join").post(guestJoinRoom);

import { getMediaToken } from "../media/media.controller.js";

// Protected routes (authenticated users or active guest sessions)
router.use(verifyJWT);
router.route("/create").post(createRoom);
router.route("/run").post(runCode);
router.route("/history").get(getAllRoomsById);
router.route("/:roomId").get(getRoomById);
router.route("/:roomId/join").post(joinRoom);
router.route("/:roomId/leave").post(leaveRoom);
router.route("/:roomId/end").post(endRoom);
router.route("/:roomId/delete").delete(deleteRoom);
router.route("/:roomId/media-token").post(getMediaToken);


export default router;
