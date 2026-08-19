import mongoose, { Schema } from "mongoose";

const organizationSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
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
                ref: "Room"
            }
        ],
        verificationStatus: {
            type: String,
            enum: ["unverified", "pending", "verified"],
            default: "unverified"
        },
        verifiedDomain: {
            type: String,
            default: null
        },
        verificationToken: {
            type: String,
            default: null
        },
        plan: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            default: "free"
        }
    },
    { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);
