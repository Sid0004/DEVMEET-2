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
            // Allow same-origin requests, direct navigation, and Render health check probes
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
};
