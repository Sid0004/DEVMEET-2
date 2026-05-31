import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Room } from "../models/room.model.js";
import {User} from "../models/user.model.js";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    if (!roomId) throw new ApiError(400, "Please provide a room ID to join");

    const room = await Room.findOne({ roomId });
    if (!room) throw new ApiError(404, "Room with this ID does not exist");

    if (room.participants.includes(userId as any)) {
        return res.status(200).json(
            new ApiResponse(200, room, "You have already joined this room")
        );
    }

    const updatedRoom = await Room.findOneAndUpdate(
        { roomId },
        { $push: { participants: userId } },
        { new: true } 
    );
    await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { rooms: room._id } }
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runCode = asyncHandler(async (req: Request, res: Response) => {
    const { code, language } = req.body;

    if (!code) {
        throw new ApiError(400, "Code is required");
    }

    const lang = (language || "TypeScript").toLowerCase();
    let fileExtension = "ts";
    let command = "";

    if (lang === "javascript") {
        fileExtension = "js";
    } else if (lang === "python") {
        fileExtension = "py";
    } else if (lang === "typescript") {
        fileExtension = "ts";
    } else {
        throw new ApiError(400, `Language ${language} is not supported for execution. We support TypeScript, JavaScript, and Python.`);
    }

    // Create temp dir if not exists
    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate unique temp filename
    const filename = `run_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExtension}`;
    const filePath = path.join(tempDir, filename);

    // Write code to file
    fs.writeFileSync(filePath, code);

    // Determine execution command
    const isWindows = process.platform === "win32";
    if (fileExtension === "py") {
        command = `python "${filePath}"`;
    } else if (fileExtension === "js") {
        command = `node "${filePath}"`;
    } else if (fileExtension === "ts") {
        const localTsx = path.resolve(__dirname, "../../node_modules/.bin/tsx");
        command = isWindows ? `"${localTsx}.cmd" "${filePath}"` : `"${localTsx}" "${filePath}"`;
    }

    // Execute the code with a timeout of 5 seconds
    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        // Clean up temp file asynchronously
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Temp file cleanup error:", unlinkErr);
        });

        if (error && error.killed) {
            return res.status(200).json(
                new ApiResponse(200, {
                    stdout: stdout,
                    stderr: stderr || "Execution timed out (5s limit exceeded).",
                    exitCode: error.code || -1
                }, "Code execution timed out")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, {
                stdout: stdout,
                stderr: stderr,
                exitCode: error ? error.code || 1 : 0
            }, "Code executed successfully")
        );
    });
});
const getAllRoomsById = asyncHandler(async (req: Request, res: Response) => {
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

    return res.status(200).json(
        new ApiResponse(200, rooms, "User room history fetched successfully")
    );
});

const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
    const { roomId } = req.params;
    if (!roomId) throw new ApiError(400, "Room ID is required");

    const deletedRoom = await Room.findOneAndDelete({ roomId });
    if (!deletedRoom) throw new ApiError(404, "Room with this ID does not exist");

    await User.updateMany(
        { rooms: deletedRoom._id },
        { $pull: { rooms: deletedRoom._id } }
    );

    return res.status(200).json(
        new ApiResponse(200, deletedRoom, "Room deleted successfully")
    );
});

export {
    createRoom,
    getRoomById,
    joinRoom,
    leaveRoom,
    runCode,
    getAllRoomsById,
    deleteRoom
};
