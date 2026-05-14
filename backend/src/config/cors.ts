import { CorsOptions } from "cors";

const defaultOrigins = ["http://localhost:3000"];

export const getAllowedOrigins = (): string[] => {
    const rawOrigins = process.env.CORS_ORIGIN;
    if (!rawOrigins) {
        return defaultOrigins;
    }
    return rawOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
};

export const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        const allowedOrigins = getAllowedOrigins();
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
};
