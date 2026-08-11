import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    },
    roomName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    status: {
        type: String,
        enum: ["active", "ended", "scheduled"],
        default: "active",
    },
    files: [
        {
            name: { type: String, required: true },
            content: { type: String, default: "" },
            language: { type: String, default: "javascript" },
        },
    ],
    roomSettings: {
        isLocked: {
            type: Boolean,
            default: false,
        },
        passcode: {
            type: String,
            default: "",
        },
        allowMic: {
            type: Boolean,
            default: true,
        },
        allowCamera: {
            type: Boolean,
            default: true,
        },
    },
}, {
    timestamps: true,
});

export const Room = mongoose.model("Room", roomSchema);
