const defaultOrigins = ["http://localhost:3000"];


export const getAllowedOrigins = () => {
    const rawOrigins = process.env.CORS_ORIGIN;

    if (!rawOrigins) {
        return defaultOrigins;
    }

    return rawOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
};

export const corsOptions = {
    origin(origin, callback) {
        const allowedOrigins = getAllowedOrigins();
        const isDevelopment = process.env.NODE_ENV !== "production";
        if (!origin) {
            // In development, allow requests without origin (for Postman, etc.)
            if (isDevelopment) {
                return callback(null, true);
            }
            // In production, block requests without origin
            return callback(new Error("CORS blocked: No origin header in production"));
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
};
