import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./src/db/index.js";
import { app } from "./app.js";
import { Room } from "./src/models/room.model.js";

dotenv.config({
    path: './.env'
});

const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
    : ["http://localhost:3000"];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", async ({ roomId, user }) => {
        if (!roomId || !user) return;

        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.user = user;

        console.log(`User ${user.username || user.fullName} joined room ${roomId}`);

        try {
            // Get all current sockets in this room
            const sockets = await io.in(roomId).fetchSockets();
            const usersInRoom = sockets
                .filter(s => s.id !== socket.id)
                .map(s => ({
                    socketId: s.id,
                    user: s.data.user
                }));

            // Fetch current room state (code & language) from DB
            const room = await Room.findOne({ roomId });
            const currentCode = room ? room.code || "" : "";
            const language = room ? room.primaryLanguage || "TypeScript" : "TypeScript";
            const messages = room ? room.messages || [] : [];
            
            // Build fallback file list if room has no files yet (backward compatibility)
            let files = room?.files || [];
            if (files.length === 0) {
                const ext = language.toLowerCase() === 'python' ? 'py' : 'ts';// it shouldnt be hardocded
                
                files = [
                    {
                        name: `main.${ext}`,
                        content: currentCode || "// Welcome to DevMeet Workspace. Collaborators will sync in real time.\nconsole.log(\"hello\")\n",
                        language: language
                    }
                ];
            }

            // Send current state to the joining user
            socket.emit("room-state", {
                code: currentCode,
                language,
                files,
                messages,
                users: usersInRoom
            });

            // Notify everyone else in the room
            socket.to(roomId).emit("user-joined", {
                socketId: socket.id,
                user: user
            });
        } catch (error) {
            console.error("Error in join-room handler:", error);
        }
    });

    socket.on("code-change", ({ code }) => {
        const roomId = socket.data.roomId;
        if (!roomId) return;

        // Broadcast to other users in the room
        socket.to(roomId).emit("code-update", { code });

        // Save code to DB in background
        Room.findOneAndUpdate({ roomId }, { code }).catch(err => {
            console.error("Failed to save room code:", err);
        });
    });

    socket.on("files-change", ({ files, activeFileIndex }) => {
        const roomId = socket.data.roomId;
        if (!roomId) return;

        // Broadcast updated files and active file index to other users
        socket.to(roomId).emit("files-update", { files, activeFileIndex });

        // Update room files in DB, and synchronize legacy code / primaryLanguage fields with the first file
        const updateObj: any = { files };
        if (files && files[0]) {
            updateObj.code = files[0].content;
            updateObj.primaryLanguage = files[0].language;
        }

        Room.findOneAndUpdate({ roomId }, updateObj).catch(err => {
            console.error("Failed to save room files:", err);
        });
    });

    socket.on("send-message", async ({ message }) => {
        const roomId = socket.data.roomId;
        const user = socket.data.user;
        if (!roomId || !user) return;

        const chatMsg = {
            sender: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName
            },
            text: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit("receive-message", chatMsg);

        // Save message to room in DB
        Room.findOneAndUpdate(
            { roomId },
            { $push: { messages: chatMsg } }
        ).catch(err => {
            console.error("Failed to save chat message:", err);
        });
    });

    socket.on("webrtc-signal", ({ targetSocketId, signal }) => {
        // Forward signal to the target peer
        io.to(targetSocketId).emit("webrtc-signal", {
            senderSocketId: socket.id,
            signal
        });
    });

    socket.on("join-call", async () => {
        const roomId = socket.data.roomId;
        const user = socket.data.user;
        if (!roomId || !user) return;

        socket.data.inCall = true;
        console.log(`User ${user.username || user.fullName} joined video call in room ${roomId}`);

        try {
            // Get all current sockets in this room who are in the call
            const sockets = await io.in(roomId).fetchSockets();
            const usersInCall = sockets
                .filter(s => s.id !== socket.id && s.data.inCall === true)
                .map(s => ({
                    socketId: s.id,
                    user: s.data.user
                }));

            // Send the list of people already in the call to this user
            socket.emit("call-state", { users: usersInCall });

            // Notify everyone else in the room
            socket.to(roomId).emit("user-joined-call", {
                socketId: socket.id,
                user: user
            });
        } catch (error) {
            console.error("Error in join-call handler:", error);
        }
    });

    socket.on("leave-call", () => {
        const roomId = socket.data.roomId;
        if (!roomId) return;

        socket.data.inCall = false;
        console.log(`Socket left call: ${socket.id}`);
        socket.to(roomId).emit("user-left-call", {
            socketId: socket.id
        });
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach((roomId) => {
            if (roomId !== socket.id) {
                socket.to(roomId).emit("user-disconnected", {
                    socketId: socket.id,
                    user: socket.data.user
                });
            }
        });
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

connectDB()
    .then(() => {
        server.on("error", (error: any) => {
            console.log("ERR: ", error);
            throw error;
        });
        
        server.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT || 8000}`);
        });
    })
    .catch((err: any) => {
        console.log("MONGO db connection failed !!! ", err);
    });

