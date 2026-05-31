import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            // console.log("---- verifyJWT: No token found");
            throw new ApiError(401, "unauthorized request");
        }

        // console.log("---- verifyJWT: Token found, verifying...");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
        // console.log("---- verifyJWT: Decoded token:", decodedToken);

        // console.log("---- verifyJWT: Querying user in DB...");
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        // console.log("---- verifyJWT: Query completed, user found:", !!user);

        if (!user) {
            // console.log("---- verifyJWT: User not found in DB");
            throw new ApiError(401, "invalid access token");
        }

        req.user = user as IUser;
        // console.log("---- verifyJWT: Done, calling next()");
        next();
    } catch (err: any) {
        // console.log("---- verifyJWT: Error occurred:", err.message || err);
        throw new ApiError(401, err.message || "invalid user");
    }
});
