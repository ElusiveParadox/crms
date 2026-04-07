import express from "express";
import dotenv from "dotenv";
import institutionRoutes from "./src/routes/institutionRoutes";

import docsRoutes from "./src/docs/docsRoutes";
import bookingRoutes from "./src/routes/booking.routes";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/institutions", institutionRoutes);
app.use("/", docsRoutes);
app.use("/bookings", bookingRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});