import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getCookieOptions } from "../utils/cookieOptions.js";
import UserService from "../services/user.service.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const createdUser = await UserService.registerUser({ username, fullName, email, password });
    
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password, email, username } = req.body;
    const loginIdentity = identifier || email || username;
    if (!loginIdentity) {
        throw new ApiError(400, "Username or email is required");
    }
    
    const { accessToken, refreshToken, loggedInUser } = await UserService.loginUser({ loginIdentity, password });

    const options = getCookieOptions(req);
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
        
    await UserService.logoutUser(req.user._id);

    const options = getCookieOptions(req);
    const clearOptions = { ...options, maxAge: undefined };
    return res
        .status(200)
        .clearCookie("accessToken", clearOptions)
        .clearCookie("refreshToken", clearOptions)
        .json(new ApiResponse(200, {}, "User logged out"));
});


const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    const user = await UserService.getCurrentUser(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, { ...user.toObject(), accessToken: token }, "User fetched successfully"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    const clearCookiesAndThrow = (statusCode, message) => {
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
        const { accessToken, refreshToken } = await UserService.refreshAccessToken(incomingRefreshToken);
        
        const options = getCookieOptions(req);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully"));
    } catch (error) {
        clearCookiesAndThrow(401, error?.message || "Invalid refresh token");
    }
});

const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, username } = req.body;
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }
    
    const updatedUser = await UserService.updateProfile(req.user._id, fullName, username, req.user.avatar);
    
    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }
    
    await UserService.changePassword(req.user._id, oldPassword, newPassword);
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const completeOnboarding = asyncHandler(async (req, res) => {
    const { profession } = req.body;
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }
    
    const user = await UserService.completeOnboarding(req.user._id, profession);
    
    return res.status(200).json(new ApiResponse(200, user, "Onboarding completed successfully"));
});

export { 
     registerUser,
     loginUser, 
     logoutUser,
     refreshAccessToken,
     getCurrentUser,
     updateProfile, 
     changePassword, 
     completeOnboarding 
};
