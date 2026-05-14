import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./src/config/cors.js";

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
export { app };
