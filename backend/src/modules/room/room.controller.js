import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getCookieOptions } from "../../utils/cookieOptions.js";
import { Room } from "./room.model.js";
import { User } from "../user/user.model.js";
import { Message } from "../chat/message.model.js";
import { runCode } from "../execution/execution.controller.js";
import RoomService from "./room.service.js";

const createRoom = asyncHandler(async (req, res) => {
    const { roomName, description, roomSettings } = req.body;
    if (!roomName || roomName.trim() === "") {
        throw new ApiError(400, "Room name is required");
    }
    const createdRoom = await RoomService.createUniqueRoom(
        roomName, 
        description,
        req.user?._id, 
        roomSettings
    );

    if (!createdRoom) {
        throw new ApiError(500, "Something went wrong while creating the room");
    }
    return res.status(201).json(new ApiResponse(201, createdRoom, "Room created successfully"));
});

const getRoomById = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    if (!roomId)
        throw new ApiError(404, "Please enter the room ID");
    const room = await Room.findOne({ roomId });
    if (!room)
        throw new ApiError(404, "Room with this ID doesnt exist");
    return res
        .status(200)
        .json(new ApiResponse(200, room, "Room fetched successfully"));
});

const joinRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    if (!roomId)
        throw new ApiError(400, "Please provide a room ID to join");
    const room = await Room.findOne({ roomId });
    if (!room)
        throw new ApiError(404, "Room with this ID does not exist");
        
    if (room.status === "ended") {
        throw new ApiError(403, "This session has ended and can no longer be joined.");
    }

    const isHost = room.host.toString() === userId.toString();

    if (room.roomSettings?.isLocked && !isHost && !room.participants.some(p => p.toString() === userId.toString())) {
        throw new ApiError(403, "This room is locked by the host.");
    }

    if (room.organization && !isHost) {
        const userOrgs = req.user.organizations?.map(o => o.toString()) || [];
        if (!userOrgs.includes(room.organization.toString())) {
            throw new ApiError(403, "You do not have permission to join this organization room.");
        }
    }
    
    if (room.participants.some(p => p.toString() === userId.toString())) {
        return res.status(200).json(new ApiResponse(200, room, "You have already joined this room"));
    }
    const updatedRoom = await Room.findOneAndUpdate({ roomId }, { $addToSet: { participants: userId } }, { new: true });
    await User.findOneAndUpdate({ _id: userId }, { $addToSet: { rooms: room._id } });
    return res.status(200).json(new ApiResponse(200, updatedRoom, "Successfully joined the room"));
});

const leaveRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    if (!roomId)
        throw new ApiError(400, "Please provide a room ID to leave");
    const room = await Room.findOne({ roomId });
    if (!room)
        throw new ApiError(404, "Room with this ID does not exist");
    const userId = req.user?._id;
    const updatedRoom = await Room.findOneAndUpdate({ roomId }, { $pull: { participants: userId } }, { new: true });
    return res.status(200).json(new ApiResponse(200, updatedRoom, "Successfully left the room"));
});

const endRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    if (!roomId)
        throw new ApiError(400, "Please provide a room ID to end");
    const room = await Room.findOne({ roomId });
    if (!room)
        throw new ApiError(404, "Room with this ID does not exist");
        
    if (room.host.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "Only the host can end the session");
    }
    
    const updatedRoom = await Room.findOneAndUpdate({ roomId }, { status: "ended" }, { new: true });
    
    await Message.deleteMany({ room: room._id });
    
    return res.status(200).json(new ApiResponse(200, updatedRoom, "Session ended successfully"));
});

const getAllRoomsById = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const rooms = await Room.find({
        $or: [
            { host: userId },
            { participants: userId }
        ]
    });
    return res.status(200).json(new ApiResponse(200, rooms, "User room history fetched successfully"));
});

const deleteRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    if (!roomId)
        throw new ApiError(400, "Room ID is required");
    if (!req.user)
        throw new ApiError(401, "Unauthorized");
    const room = await Room.findOne({ roomId });
    if (!room)
        throw new ApiError(404, "Room with this ID does not exist");

    if (room.host.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the room host can delete this room");
    }
    const deletedRoom = await Room.findOneAndDelete({ roomId });
    if (!deletedRoom) {
        throw new ApiError(404, "Room not found during deletion");
    }
    await User.updateMany({ rooms: deletedRoom._id }, { $pull: { rooms: deletedRoom._id } });
    return res.status(200).json(new ApiResponse(200, deletedRoom, "Room deleted successfully"));
});

const getRoomPublicInfo = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    if (!roomId) throw new ApiError(400, "Room ID is required");

    const room = await Room.findOne({ roomId })
        .select("roomId roomName description status roomType roomSettings host organization createdAt")
        .populate("host", "fullName username avatar");

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                roomId: room.roomId,
                roomName: room.roomName,
                description: room.description,
                status: room.status,
                isLocked: !!room.roomSettings?.isLocked,
                host: room.host ? {
                    fullName: room.host.fullName,
                    username: room.host.username,
                    avatar: room.host.avatar
                } : null,
                requiresOrg: !!room.organization
            },
            "Room details retrieved"
        )
    );
});

const guestJoinRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { name } = req.body;

    if (!roomId) {
        throw new ApiError(400, "Room ID is required");
    }

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Please provide your name to join as a guest");
    }

    const room = await Room.findOne({ roomId }).select("roomId roomName status roomSettings organization host");
    if (!room) {
        throw new ApiError(404, "Room with this ID does not exist");
    }

    if (room.status === "ended") {
        throw new ApiError(403, "This session has ended and can no longer be joined");
    }

    if (room.roomSettings?.isLocked) {
        throw new ApiError(403, "This room is currently locked by the host");
    }

    if (room.organization) {
        throw new ApiError(403, "Organization rooms require a verified team account to join");
    }

    const cleanName = name.trim();
    const guestObjectId = new mongoose.Types.ObjectId().toString();
    const guestUsername = `guest_${cleanName.toLowerCase().replace(/[^a-z0-9_]/g, "") || "user"}_${guestObjectId.slice(-4)}`;
    const guestAvatar = `https://api.dicebear.com/7.x/dylan/svg?seed=${encodeURIComponent(cleanName)}`;

    const guestPayload = {
        _id: guestObjectId,
        fullName: cleanName,
        username: guestUsername,
        avatar: guestAvatar,
        isGuest: true,
        roomId: room.roomId,
        role: "guest",
    };

    const guestAccessToken = jwt.sign(
        guestPayload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "6h" }
    );

    const cookieOptions = getCookieOptions(req);
    res.cookie("accessToken", guestAccessToken, {
        ...cookieOptions,
        maxAge: 6 * 60 * 60 * 1000 // 6 hours
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: guestPayload,
                accessToken: guestAccessToken,
                room: {
                    roomId: room.roomId,
                    roomName: room.roomName,
                }
            },
            "Guest access granted"
        )
    );
});

export { createRoom, getRoomById, joinRoom, leaveRoom, endRoom, runCode, getAllRoomsById, deleteRoom, getRoomPublicInfo, guestJoinRoom };
