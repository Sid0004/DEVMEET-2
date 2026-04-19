import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Room } from "../models/room.model.js";

/**
  * 1) CREATE ROOM
 * This is an example of how you can write a controller function.
 * It uses 'asyncHandler' to automatically catch errors and avoid try-catch blocks.
 * Inside, we perform validation, database operations, and return an ApiResponse.
 */
const createRoom = asyncHandler(async (req, res) => {
    // Step 1: Get data from the request body
    const { roomId, roomSettings } = req.body;

    // Step 2: Validate the required fields
    if (!roomId || roomId.trim() === "") {
        throw new ApiError(400, "Room ID is required");
    }

    // Step 3: Check if a room with the same ID already exists
    const existingRoom = await Room.findOne({ roomId });
    if (existingRoom) {
        throw new ApiError(409, "A room with this ID already exists");
    }

    // Step 4: Create the room in the database
    // We assume 'req.user' exists (because this route should be protected by a verifyJWT middleware)
    const newRoom = await Room.create({
        roomId: roomId.trim(),
        host: req.user._id, // The logged-in user becomes the host
        participants: [req.user._id], // Optionally add the host to the participants list initially
        status: "active",
        roomSettings: roomSettings || {}
    });

    // Step 5: Verify it was created
    const createdRoom = await Room.findById(newRoom._id);
    if (!createdRoom) {
        throw new ApiError(500, "Something went wrong while creating the room");
    }

    // Step 6: Return a success response
    return res.status(201).json(
        new ApiResponse(201, createdRoom, "Room created successfully")
    );
});


/********************************************************************************
 * INSTRUCTIONS FOR YOU TO CODE THE OTHER CONTROLLERS
 ********************************************************************************
 * 
 * You will need to write the remaining controllers below. Here is your roadmap:
 * 
 * 2) GET ROOM DETAILS (getRoomById)
 *    - Wrap your function in: `const getRoomById = asyncHandler(async (req, res) => { ... })`
 *    - Get the roomId from params (e.g. `const { roomId } = req.params;`)
 *    - Use `await Room.findOne({ roomId })` to find the room.
 *    - If not found, `throw new ApiError(404, "Room not found");`
 *    - Return `res.status(200).json(new ApiResponse(200, room, "Room fetched successfully"));`
 *
 * 3) JOIN ROOM (joinRoom)
 *    - Get `req.user._id` (from middleware) and `roomId` (from req.body or req.params).
 *    - Find the room.
 *    - Check if the user is already in the `participants` array. 
 *    - If not, use `await Room.findOneAndUpdate({ roomId }, { $push: { participants: req.user._id } }, { new: true })`
 *    - Return the updated room.
 * 
 * 4) LEAVE ROOM OR END ROOM (endRoom)
 *    - A controller for the host to change the room `status` to "ended".
 *    - Make sure you check if `req.user._id.toString() === room.host.toString()` before allowing them to end it!
 * 
 * Finally, don't forget to export your new controllers!
 ********************************************************************************/

export {
    createRoom,
    // getRoomById,
    // joinRoom,
    // endRoom
};
