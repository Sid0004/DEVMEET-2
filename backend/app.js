import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./src/config/cors.js";
import morgan from "morgan";
import helmet from "helmet";

const app = express();


app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());


// routes import
import userRouter from './src/modules/user/user.routes.js';
import roomRouter from './src/modules/room/room.routes.js';
import { errorHandler } from "./src/middlewares/error.middleware.js";


app.use("/api/v1/users", userRouter);
app.use("/api/v1/rooms", roomRouter);

// Global error handling middleware
app.use(errorHandler)
export { app };
