import { Room } from "../models/room.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Service to handle business logic for Rooms.
 * This separates the "how we interact with the database" from "how we respond to the HTTP request".
 */
class RoomService {
    /**
     * Creates a new room with a unique 6-digit ID.
     */
    static async createUniqueRoom(roomName, description, hostId, roomSettings) {
        let generatedRoomId = "";
        let isUnique = false;
        let attempts = 0;
        
        // Business logic: Generating a unique 6-digit room code
        while (!isUnique && attempts < 5) {
            generatedRoomId = Math.floor(100000 + Math.random() * 900000).toString();
            const existingRoom = await Room.findOne({ roomId: generatedRoomId });
            if (!existingRoom) {
                isUnique = true;
            }
            attempts++;
        }
        
        if (!isUnique) {
            throw new ApiError(500, "Could not generate a unique room code. Please try again.");
        }
        
        // Business logic: Database interaction
        const newRoom = await Room.create({
            roomId: generatedRoomId,
            roomName: roomName.trim(),
            description: description || "",
            host: hostId,
            participants: hostId ? [hostId] : [],
            status: "active",
            roomSettings: roomSettings || {}
        });
        
        return await Room.findById(newRoom._id);
    }
}

export default RoomService;
