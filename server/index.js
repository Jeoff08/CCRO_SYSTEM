import express from "express";
import cors from "cors";
import boxesRouter from "./routes/boxes.js";
import locationProfilesRouter from "./routes/locationProfiles.js";
import activityLogsRouter from "./routes/activityLogs.js";
import authRouter from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/boxes", boxesRouter);
app.use("/api/location-profiles", locationProfilesRouter);
app.use("/api/activity-logs", activityLogsRouter);
app.use("/api/auth", authRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CCRO Archive Locator API is running" });
});

// Global error handler (must be registered after routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
