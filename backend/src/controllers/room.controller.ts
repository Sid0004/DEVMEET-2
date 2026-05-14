import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Room } from "../models/room.model.js";

const createRoom = asyncHandler(async (req: Request, res: Response) => {
    const { roomName, primaryLanguage, roomSettings } = req.body;

    if (!roomName || roomName.trim() === "") {
        throw new ApiError(400, "Room name is required");
    }

    let generatedRoomId = "";
    let isUnique = false;
    let attempts = 0;

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

    const newRoom = await Room.create({
        roomId: generatedRoomId,
        roomName: roomName.trim(),
        primaryLanguage: primaryLanguage || "TypeScript",
        host: req.user?._id,
        participants: req.user?._id ? [req.user._id] : [],
        status: "active",
        roomSettings: roomSettings || {}
    });

    const createdRoom = await Room.findById(newRoom._id);
    if (!createdRoom) {
        throw new ApiError(500, "Something went wrong while creating the room");
    }

    return res.status(201).json(
        new ApiResponse(201, createdRoom, "Room created successfully")
    );
});

const getRoomById = asyncHandler(async (req: Request, res: Response) => {
    const { roomId } = req.params;
    if (!roomId) throw new ApiError(404, "Please enter the room ID");
    const room = await Room.findOne({ roomId });
    if (!room) throw new ApiError(404, "Room with this ID doesnt exist");

    return res
        .status(200)
        .json(new ApiResponse(200, room, "Room fetched successfully"));
});

const joinRoom = asyncHandler(async (req: Request, res: Response) => {
    const { roomId } = req.params; 
    if (!roomId) throw new ApiError(400, "Please provide a room ID to join");

    const room = await Room.findOne({ roomId });
    if (!room) throw new ApiError(404, "Room with this ID does not exist");

    const userId = req.user?._id;
    if (userId && room.participants.includes(userId as any)) {
        return res.status(200).json(
            new ApiResponse(200, room, "You have already joined this room")
        );
    }

    const updatedRoom = await Room.findOneAndUpdate(
        { roomId },
        { $push: { participants: userId } },
        { new: true } 
    );

    return res.status(200).json(
        new ApiResponse(200, updatedRoom, "Successfully joined the room")
    );
});

const leaveRoom = asyncHandler(async (req: Request, res: Response) => {
    const { roomId } = req.params;
    if (!roomId) throw new ApiError(400, "Please provide a room ID to leave");

    const room = await Room.findOne({ roomId });
    if (!room) throw new ApiError(404, "Room with this ID does not exist");

    const userId = req.user?._id;

    const updatedRoom = await Room.findOneAndUpdate(
        { roomId },
        { $pull: { participants: userId } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedRoom, "Successfully left the room")
    );
});

export {
    createRoom,
    getRoomById,
    joinRoom,
    leaveRoom
};
