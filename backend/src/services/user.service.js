import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

class UserService {
    static generateAccessAndRefreshTokens = async (userId) => {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error("User not found");
                
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });
            return { accessToken, refreshToken };
        }
        catch (error) {
            console.error(" TOKEN GENERATION ERROR:", error.message);
            throw new ApiError(500, `Something went wrong while generating tokens: ${error.message}`);
        }
    };

    static async registerUser(userData) {
        const { username, fullName, email, password } = userData;
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existedUser) {
            throw new ApiError(409, "User with this email or username already exists");
        }
        const user = await User.create({
            fullName,
            avatar: `https://api.dicebear.com/7.x/dylan/svg?seed=${encodeURIComponent(username || fullName)}`,
            email,
            password,
            username: username.toLowerCase()
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if(createdUser) return createdUser;
        else return null;
    }

    static async loginUser(userData) {
        const { loginIdentity, password } = userData;
        
        const user = await User.findOne({
            $or:[
                {username: loginIdentity.toLowerCase()},
                {email: loginIdentity.toLowerCase()}
            ]
        });

        if (!user) throw new ApiError(401, "Invalid email/username or password");

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) throw new ApiError(401, "Invalid email/username or password");

        const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        if (loggedInUser) return { accessToken, refreshToken, loggedInUser };
        else return null;
    }

    static async logoutUser(userId) {
        await User.findByIdAndUpdate(userId,
            { $set: { refreshToken: undefined } },
            { new: true }
        );
    }

    static async getCurrentUser(userId) {
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) throw new ApiError(404, "User not found");
        return user;
    }

    static async refreshAccessToken(incomingRefreshToken) {
        try {
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id);
            if (!user) {
                throw new ApiError(401, "Invalid refresh token");
            }
            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used");
            }
            
            const { accessToken, refreshToken } = await this.generateAccessAndRefreshTokens(user._id);
            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid refresh token");
        }
    }

    static async updateProfile(userId, fullName, username, currentAvatar) {
        const updates = {};
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
            // Check if it's already taken
            const existedUser = await User.findOne({ username: cleanUsername });
            if (existedUser && existedUser._id.toString() !== userId.toString()) {
                throw new ApiError(409, "Username is already taken");
            }
            updates.username = cleanUsername;
        }
        if (updates.fullName && currentAvatar && currentAvatar.startsWith("https://ui-avatars.com/")) {
            updates.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(updates.fullName)}&background=random&color=fff`;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: updates
        }, {
            new: true
        }).select("-password -refreshToken");

        return updatedUser;
    }

    static async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Incorrect current password");
        }
        user.password = newPassword;
        await user.save();
    }

    static async completeOnboarding(userId, profession) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        
        if (profession) {
            user.profession = profession;
        }
        user.isOnboarded = true;
        await user.save({ validateBeforeSave: false });
        
        return user;
    }
}

export default UserService;