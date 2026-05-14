import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
    roomId: string;
    roomName: string;
    primaryLanguage: string;
    host: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    status: "active" | "ended" | "scheduled";
    roomSettings: {
        micEnabled: boolean;
        cameraEnabled: boolean;
        waitingRoom: boolean;
    };
}

const roomSchema = new Schema<IRoom>({
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

export const Room = mongoose.model<IRoom>("Room", roomSchema);
