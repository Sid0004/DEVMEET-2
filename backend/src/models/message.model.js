import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        room: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["text", "system", "code_snippet"],
            default: "text"
        }
    },
    { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
