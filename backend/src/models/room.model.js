import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
    },
    roomName: {
        type: String,
        required: true,
    },
    primaryLanguage: {
        type: String,
        default: "TypeScript"
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    status: {
        type: String,
        enum: ["active", "ended", "scheduled"],
        default: "scheduled"
    },
    roomSettings: {
        micEnabled: {
            type: Boolean,
            default: true
        },
        cameraEnabled: {
            type: Boolean,
            default: true
        },
        waitingRoom: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

export const Room = mongoose.model("Room", roomSchema);
