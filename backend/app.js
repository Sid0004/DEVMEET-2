import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./src/config/cors.js";
import morgan from "morgan";
import helmet from "helmet";
import sendTestEmail from "./src/utils/mail.js";
const app = express();


app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// routes import
import userRouter from './src/modules/user/user.routes.js';
import roomRouter from './src/modules/room/room.routes.js';
import mediaRouter from './src/modules/media/media.routes.js';
import executionRouter from './src/modules/execution/execution.routes.js';
import { errorHandler } from "./src/middlewares/error.middleware.js";
import { apiReference } from "@scalar/express-api-reference";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./src/docs/openapi.js";

// Health check endpoint for cloud monitoring and probes
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "DevMeet Backend Service",
    timestamp: new Date().toISOString(),
  });
});

// OpenAPI JSON endpoint
app.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(openApiSpec);
});

// Classic Swagger UI (Green GET, Blue POST, Red DELETE badges)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customSiteTitle: "DEVMEET-2 Swagger UI",
  })
);
app.use("/swagger", (req, res) => res.redirect("/api-docs"));

// Modern Scalar API Documentation
app.use(
  "/docs",
  apiReference({
    theme: "purple",
    darkMode: true,
    pageTitle: "DEVMEET-2 API Reference",
    spec: {
      content: openApiSpec,
    },
  })
);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/media", mediaRouter);
app.use("/api/v1/execution", executionRouter);

// Global error handling middleware
app.use(errorHandler)
export { app };

