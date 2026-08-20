import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { getCookieOptions } from "../../utils/cookieOptions.js";
import UserService from "./user.service.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, accountType, organizationName } = req.body;
    if ([fullName, email, username, password].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "All required fields must be filled");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username.trim())) {
        throw new ApiError(400, "Username must be 3-30 characters long and can only contain letters, numbers, and underscores");
    }

    if (password.length < 8 || !/\d/.test(password)) {
        throw new ApiError(400, "Password must be at least 8 characters long and contain at least one number");
    }

    if (accountType === "organization" && (!organizationName || organizationName.trim() === "")) {
        throw new ApiError(400, "Organization name is required for team accounts");
    }

    const createdUser = await UserService.registerUser({
        username,
        fullName,
        email,
        password,
        accountType,
        organizationName
    });
    
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
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

const googleLoginUser = asyncHandler(async (req, res) => {
    const { token, idToken, credential } = req.body;
    const googleToken = token || idToken || credential;

    if (!googleToken) {
        throw new ApiError(400, "Google authentication token is required");
    }

    const { accessToken, refreshToken, loggedInUser } = await UserService.googleLogin(googleToken);

    const options = getCookieOptions(req);
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "Google login successful"));
});

const githubLoginUser = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) {
        throw new ApiError(400, "GitHub authorization code is required");
    }

    const { accessToken, refreshToken, loggedInUser } = await UserService.githubLogin(code);

    const options = getCookieOptions(req);
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "GitHub login successful"));
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
    const user = await UserService.getCurrentUser(req.user._id);

    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const { accessToken, refreshToken } = await UserService.refreshAccessToken(incomingRefreshToken);

    const options = getCookieOptions(req);
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
});

const updateProfile = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const updatedUser = await UserService.updateProfile(req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }
    if (!req.user) throw new ApiError(401, "Unauthorized");

    await UserService.changePassword(req.user._id, oldPassword, newPassword);
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const completeOnboarding = asyncHandler(async (req, res) => {
    const { profession, orgAction, orgInput } = req.body;
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const updatedUser = await UserService.completeOnboarding(req.user._id, { profession, orgAction, orgInput });
    return res.status(200).json(new ApiResponse(200, updatedUser, "Onboarding completed successfully"));
});

export {
    registerUser,
    loginUser,
    googleLoginUser,
    githubLoginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    updateProfile,
    changePassword,
    completeOnboarding
};
