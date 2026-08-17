import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import { connectDB } from "./config/db";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/auth.routes";
import servicesRoutes from "./routes/services.routes";
import testimonialsRoutes from "./routes/testimonials.routes";
import healthGuideRoutes from "./routes/healthGuide.routes";
import locationsRoutes from "./routes/locations.routes";
import siteSettingsRoutes from "./routes/siteSettings.routes";
import uploadRoutes from "./routes/upload.routes";

async function bootstrap() {
  // Connect to MongoDB first
  await connectDB();

  const app = express();

  // ── Security Middleware ────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ── Rate Limiting ──────────────────────────────────────────
  // Strict limit on auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // General API rate limit
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    message: { success: false, message: "Too many requests. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/", apiLimiter);
  app.use("/api/auth/login", authLimiter);

  // ── Body Parsing ───────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ── Logging ────────────────────────────────────────────────
  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // ── Health Check ───────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // ── API Routes ─────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/services", servicesRoutes);
  app.use("/api/testimonials", testimonialsRoutes);
  app.use("/api/health-guide", healthGuideRoutes);
  app.use("/api/locations", locationsRoutes);
  app.use("/api/settings", siteSettingsRoutes);
  app.use("/api/upload", uploadRoutes);

  // ── 404 + Error Handlers ───────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  // ── Start Server ───────────────────────────────────────────
  const PORT = parseInt(env.PORT, 10);
  app.listen(PORT, () => {
    console.log(`\n🚀 Sunshine CMS API running on port ${PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Health: http://localhost:${PORT}/health\n`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
