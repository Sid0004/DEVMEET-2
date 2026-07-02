export const getCookieOptions = (req) => {
    const isProduction = process.env.NODE_ENV === "production";
    // Check if the request is secure (HTTPS) or running behind a proxy (like ngrok)
    const isSecure = isProduction ||
        (req && (req.secure || req.headers["x-forwarded-proto"] === "https"));
    return {
        httpOnly: true,
        secure: isSecure ? true : false,
        sameSite: isSecure ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
};
