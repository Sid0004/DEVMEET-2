import winston from "winston";

// Define the format for our logs (what they should look like)
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
);

// Create the actual logger
export const logger = winston.createLogger({
    level: "info",
    format: logFormat,
    transports: [
        // 1. Print all logs to the terminal (just like console.log)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), // Add colors to the terminal!
                winston.format.simple()
            )
        }),
        // 2. Save all "error" level logs to a file permanently
        new winston.transports.File({ 
            filename: "logs/error.log", 
            level: "error" 
        }),
        // 3. Save ALL logs (info, warning, error) to a combined file
        new winston.transports.File({ 
            filename: "logs/combined.log" 
        })
    ]
});
