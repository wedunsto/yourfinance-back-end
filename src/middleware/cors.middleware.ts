/**
 * Address CORS errors by adding the correct Access-Control-ALlow-* headers to server responses. 
 * This tells the browser which origins, methods, and headers are permitted
 */
import "dotenv/config";

export const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map(origin => origin.trim());