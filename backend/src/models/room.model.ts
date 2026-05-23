import mongoose, { Schema, Document } from "mongoose";

export interface IFile {
    name: string;
    content: string;
    language: string;
}

export interface IMessage {
    sender: {
        _id?: string;
        username?: string;
        fullName?: string;
    };
    text: string;
    timestamp: string;
}

export interface IRoom extends Document {
    roomId: string;
    roomName: string;
    primaryLanguage: string;
    host: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    status: "active" | "ended" | "scheduled";
    code?: string;
    files?: IFile[];
    messages?: IMessage[];
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
    code: {
        type: String,
        default: ""
    },
    files: {
        type: [
            {
                name: { type: String, required: true },
                content: { type: String, default: "" },
                language: { type: String, required: true }
            }
        ],
        default: []
    },
    messages: {
        type: [
            {
                sender: {
                    _id: { type: String },
                    username: { type: String },
                    fullName: { type: String }
                },
                text: { type: String, required: true },
                timestamp: { type: String, required: true }
            }
        ],
        default: []
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
