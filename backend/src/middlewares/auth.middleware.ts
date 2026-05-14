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

        if (!token) throw new ApiError(401, "unauthorized request");

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) throw new ApiError(401, "invalid access token");

        req.user = user as IUser;
        next();
    } catch (err: any) {
        throw new ApiError(401, err.message || "invalid user");
    }
});
