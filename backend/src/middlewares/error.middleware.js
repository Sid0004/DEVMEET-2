import { logger } from "../utils/logger.js";

/**
 * Global Error Handling Middleware
 * Catch-all for any errors thrown in controllers or services.
 */
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Use our new Winston logger instead of console.error!
    logger.error(`[Error] ${req.method} request to ${req.url}: ${err.message}`);
    
    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || []
    });
};
