import { CookieOptions } from "express";

export const getCookieOptions = (): CookieOptions => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    };
};
