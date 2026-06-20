import { Router } from "express";
import { createRoom, getRoomById, joinRoom, leaveRoom, runCode,getAllRoomsById , deleteRoom} from "../controllers/room.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to all room routes
router.use(verifyJWT);

router.route("/create").post(createRoom);
router.route("/run").post(runCode);

router.route("/history").get(getAllRoomsById);


router.route("/:roomId").get(getRoomById);
router.route("/:roomId/join").post(joinRoom);

router.route("/:roomId/leave").post(leaveRoom);

router.route("/:roomId/delete").delete(deleteRoom);


export default router;
