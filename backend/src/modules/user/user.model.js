import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    username: {
        type: String,
        required: [true,"username can not be empty"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    profession: {
        type: String,
        enum: ['Student', 'Employee', 'Freelancer', 'Other'],
        required: true,
        default: 'Other'
    },
    isOnboarded: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    accountType: {
        type: String,
        enum: ['individual', 'organization'],
        default: 'individual'
    },
    sessionHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Room"
        }
    ],
    rooms: [
        {
            type: Schema.Types.ObjectId,
            ref: "Room"
        }
    ],
    organizations: [
        {
            type: Schema.Types.ObjectId,
            ref: "Organization"
        }
    ],
    password: {
        type: String,
        required: function () {
            return this.authProvider === "local" || !this.authProvider;
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ["local", "google", "github"],
        default: "local"
    },
    refreshToken: {
        type: String
    },
}, {
    timestamps: true
});

userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password)
        return false;
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
};

export const User = mongoose.model("User", userSchema);
