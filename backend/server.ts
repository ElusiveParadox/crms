import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./src/config/env";
import { apiLimiter } from "./src/middleware/rateLimiter";
import { errorHandler } from "./src/middleware/error.middleware";

// Route imports
import authRoutes from "./src/routes/auth.routes";
import userRoutes from "./src/routes/user.routes";
import institutionRoutes from "./src/routes/institutionRoutes";
import bookingRoutes from "./src/routes/booking.routes";
import resourceRoutes from "./src/routes/resource.routes";
import docsRoutes from "./src/docs/docsRoutes";

const app = express();

// 1. Security Middleware
app.use(helmet());
app.use(cors()); // Configure with specific origin in production if needed
app.use(apiLimiter);

// 2. Request Parsing
app.use(express.json());

// 3. Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/institutions", institutionRoutes);
app.use("/bookings", bookingRoutes);
app.use("/resources", resourceRoutes);
app.use("/", docsRoutes);

// 4. Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 5. Global Error Handler (Keep this last)
app.use(errorHandler);

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
});