import express from "express";
import "./src/app";
import cors from "cors";
import helmet from "helmet";
import { env } from "./src/config/env";
import { apiLimiter } from "./src/middleware/rateLimiter";
import { errorHandler } from "./src/middleware/error.middleware";

import authRoutes from "./src/routes/auth.routes";
import userRoutes from "./src/routes/user.routes";
import institutionRoutes from "./src/routes/institutionRoutes";
import bookingRoutes from "./src/routes/booking.routes";
import resourceRoutes from "./src/routes/resource.routes";
import docsRoutes from "./src/docs/docsRoutes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(apiLimiter);

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/institutions", institutionRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/", docsRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in ${env.NODE_ENV} mode on ${env.BACKEND_URL}`);
});
