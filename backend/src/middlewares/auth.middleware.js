import { User } from "../modules/user/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            // console.log("---- verifyJWT: No token found");
            throw new ApiError(401, "unauthorized request");
        }
        // console.log("---- verifyJWT: Token found, verifying...");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Ephemeral guest sessions
        if (decodedToken?.isGuest) {
            req.user = {
                _id: decodedToken._id,
                username: decodedToken.username,
                fullName: decodedToken.fullName,
                avatar: decodedToken.avatar,
                isGuest: true,
                guestRoomId: decodedToken.roomId,
                role: "guest",
            };
            return next();
        }

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "invalid access token");
        }
        req.user = user;
        next();
    }
    catch (err) {
        // console.log("---- verifyJWT: Error occurred:", err.message || err);
        throw new ApiError(401, err.message || "invalid user");
    }
});
