import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./src/config/cors.js";
import { ApiError } from "./src/utils/ApiError.js";

const app: Express = express();

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Debugging: Log incoming requests to terminal
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`-------- ${req.method} request to ${req.url}`);
    next();
});

// routes import
import userRouter from './src/routes/user.routes.js'
import roomRouter from './src/routes/room.routes.js'

app.use("/api/v1/users", userRouter)
app.use("/api/v1/rooms", roomRouter)

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`Error processing ${req.method} request to ${req.url}:`, err);
    
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || []
    });
});

export { app };
