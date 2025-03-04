import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";

dotenv.config();

export const setupGlobalMiddlewares = (app) => {
  app.use(cookieParser());
  app.use(
    compression({
      level: 6, // Adjust compression level (0-9)
      threshold: 1024, // Only compress responses larger than 1KB
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
          return false; // Skip compression if this header is present
        }
        return compression.filter(req, res);
      },
    })
  );
  app.use(express.json({ limit: "10mb" })); // Global JSON limit

  app.use(express.urlencoded({ extended: true }));  // Allows complex, nested objects in URL-encoded data. 
  app.use(mongoSanitize());

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://apis.google.com"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
          connectSrc: [
            "'self'",
            "https://res.cloudinary.com",
            "ws://localhost:5000", // WebSockets for Redis
            "wss://your-redis-server.com", // Remote Redis
          ],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          frameSrc: ["'self'", "https://www.youtube.com"],
        },
      },
      frameguard: { action: "deny" }, // Prevent clickjacking
      xContentTypeOptions: true, // Prevent MIME type sniffing
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      crossOriginEmbedderPolicy: false, // Fix for Cloudinary images
    })
  );

  // Rate limiter for general API requests
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // Allow 500 requests per minute
    message: "Too many requests, slow down!",
    headers: true,
    keyGenerator: (req) => req.ip,
  });


  app.use("/api/", apiLimiter);
};