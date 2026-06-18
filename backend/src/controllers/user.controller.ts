import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { getCookieOptions } from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId: mongoose.Types.ObjectId | string) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error: any) {
        console.error(" TOKEN GENERATION ERROR:", error.message);
        throw new ApiError(500, `Something went wrong while generating tokens: ${error.message}`);
    }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`,
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { identifier, password, email, username } = req.body;

    const loginIdentity = identifier || email || username;

    if (!loginIdentity) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [
            { username: loginIdentity.toLowerCase() },
            { email: loginIdentity.toLowerCase() }
        ]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id as mongoose.Types.ObjectId);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = getCookieOptions(req);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = getCookieOptions(req);
    const clearOptions = { ...options, maxAge: undefined };

    return res
        .status(200)
        .clearCookie("accessToken", clearOptions)
        .clearCookie("refreshToken", clearOptions)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    const userObj = req.user ? req.user.toObject() : {};
    
    // Remove sensitive fields
    delete userObj.password;
    delete userObj.refreshToken;

    return res
        .status(200)
        .json(new ApiResponse(200, { ...userObj, accessToken: token }, "User fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    const clearCookiesAndThrow = (statusCode: number, message: string) => {
        const options = getCookieOptions(req);
        const clearOptions = { ...options, maxAge: undefined };
        res.clearCookie("accessToken", clearOptions);
        res.clearCookie("refreshToken", clearOptions);
        throw new ApiError(statusCode, message);
    };

    if (!incomingRefreshToken) {
        clearCookiesAndThrow(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as any;

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            clearCookiesAndThrow(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            clearCookiesAndThrow(401, "Refresh token is expired or used");
        }

        const options = getCookieOptions(req);

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user!._id as mongoose.Types.ObjectId);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }
        const options = getCookieOptions(req);
        const clearOptions = { ...options, maxAge: undefined };
        res.clearCookie("accessToken", clearOptions);
        res.clearCookie("refreshToken", clearOptions);
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, username } = req.body;

    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    const updates: { fullName?: string; username?: string; avatar?: string } = {};

    if (fullName !== undefined) {
        if (fullName.trim() === "") {
            throw new ApiError(400, "Full name cannot be empty");
        }
        updates.fullName = fullName.trim();
    }

    if (username !== undefined) {
        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername === "") {
            throw new ApiError(400, "Username cannot be empty");
        }
        if (cleanUsername !== req.user.username) {
            const existedUser = await User.findOne({ username: cleanUsername });
            if (existedUser) {
                throw new ApiError(409, "Username is already taken");
            }
            updates.username = cleanUsername;
        }
    }

    if (updates.fullName && req.user.avatar && req.user.avatar.startsWith("https://ui-avatars.com/")) {
        updates.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(updates.fullName)}&background=random&color=fff`;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: updates
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect current password");
    }

    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    updateProfile,
    changePassword
};

