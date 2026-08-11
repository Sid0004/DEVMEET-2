import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true,
        index: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [2000, "Message content cannot exceed 2000 characters"],
    },
    type: {
        type: String,
        enum: ["text", "system", "file", "code"],
        default: "text",
    },
}, {
    timestamps: true,
});

// Compound index for fast chat history retrieval
messageSchema.index({ room: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
