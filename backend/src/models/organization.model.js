import mongoose, { Schema } from "mongoose";

const organizationSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        members: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                role: {
                    type: String,
                    enum: ["Admin", "Member", "Viewer"],
                    default: "Member"
                }
            }
        ],
        rooms: [
            {
                type: Schema.Types.ObjectId,
                ref: "Room" // Capitalized "Room" instead of "room" which matches exports
            }
        ]
    },
    { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);
