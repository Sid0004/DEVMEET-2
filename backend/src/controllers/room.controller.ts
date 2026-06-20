import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Room } from "../models/room.model.js";
import {User} from "../models/user.model.js";
import { exec, execFile } from "child_process";
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
    // Disable code execution by default for security reasons
    // To enable, set ENABLE_CODE_EXECUTION=true in .env
    if (process.env.ENABLE_CODE_EXECUTION !== "true") {
        throw new ApiError(403, "Code execution feature is disabled for security reasons");
    }

    const { code, language } = req.body;

    if (!code) {
        throw new ApiError(400, "Code is required");
    }

    const lang = (language || "TypeScript").trim().toLowerCase();
    let fileExtension = "ts";
    let executablePath = "";
    let args: string[] = [];

    // Setup temporary directory
    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    if (lang === "javascript" || lang === "js") {
        fileExtension = "js";
        executablePath = "node";
    } else if (lang === "python" || lang === "py") {
        fileExtension = "py";
        executablePath = "python";
    } else if (lang === "typescript" || lang === "ts") {
        fileExtension = "ts";
        executablePath = path.resolve(__dirname, "../../node_modules/.bin/tsx");
        if (process.platform === "win32") {
            executablePath += ".cmd";
        }
    } else if (lang === "go") {
        fileExtension = "go";
        executablePath = "go";
    } else if (lang === "java") {
        fileExtension = "java";
        executablePath = "java";
    } else if (lang === "cpp" || lang === "c++" || lang === "c" || lang === "rust" || lang === "rs") {
        fileExtension = (lang === "cpp" || lang === "c++") ? "cpp" : (lang === "c" ? "c" : "rs");
        const filename = `run_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExtension}`;
        const filePath = path.join(tempDir, filename);
        fs.writeFileSync(filePath, code);

        const outBinary = filePath.replace(`.${fileExtension}`, process.platform === "win32" ? ".exe" : "");
        const compiler = fileExtension === "cpp" ? "g++" : (fileExtension === "c" ? "gcc" : "rustc");
        const compilerArgs = fileExtension === "rs" ? [filePath, "-o", outBinary] : [filePath, "-o", outBinary];

        execFile(compiler, compilerArgs, { timeout: 8000 }, (compileErr: any, compileStdout: string, compileStderr: string) => {
            if (compileErr) {
                fs.unlink(filePath, () => {});
                return res.status(200).json(
                    new ApiResponse(200, {
                        stdout: compileStdout,
                        stderr: compileStderr || compileErr.message,
                        exitCode: compileErr.code || 1
                    }, "Compilation failed")
                );
            }

            execFile(outBinary, [], { timeout: 5000 }, (runErr: any, runStdout: string, runStderr: string) => {
                fs.unlink(filePath, () => {});
                fs.unlink(outBinary, () => {});

                if (runErr && runErr.killed) {
                    return res.status(200).json(
                        new ApiResponse(200, {
                            stdout: runStdout,
                            stderr: runStderr || "Execution timed out (5s limit exceeded).",
                            exitCode: runErr.code || -1
                        }, "Code execution timed out")
                    );
                }

                return res.status(200).json(
                    new ApiResponse(200, {
                        stdout: runStdout,
                        stderr: runStderr,
                        exitCode: runErr ? runErr.code || 1 : 0
                    }, "Code executed successfully")
                );
            });
        });
        return;
    } else {
        throw new ApiError(400, `Language ${language} is not supported for execution.`);
    }

    // Generate unique temp filename for direct execution scripts
    const filename = `run_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExtension}`;
    const filePath = path.join(tempDir, filename);

    // Write code to file
    fs.writeFileSync(filePath, code);

    if (lang === "go") {
        args = ["run", filePath];
    } else {
        args = [filePath];
    }

    // Execute the code with a timeout of 5 seconds
    execFile(executablePath, args, { timeout: 5000 }, (error: any, stdout: string, stderr: string) => {
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
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const room = await Room.findOne({ roomId });
    if (!room) throw new ApiError(404, "Room with this ID does not exist");

    // Only allow the host to delete the room
    if (room.host.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the room host can delete this room");
    }

    const deletedRoom = await Room.findOneAndDelete({ roomId });
    if (!deletedRoom) {
        throw new ApiError(404, "Room not found during deletion");
    }

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
