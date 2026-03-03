import express from "express";
import cors from "cors";
import boxesRouter, { handleExportDb } from "./routes/boxes.js";
import locationProfilesRouter from "./routes/locationProfiles.js";
import activityLogsRouter from "./routes/activityLogs.js";
import authRouter from "./routes/auth.js";
import personnelRouter from "./routes/personnel.js";
import checkoutsRouter from "./routes/checkouts.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes: register /api/boxes/export-db on the app so it is matched before the boxes router (avoids "export-db" being treated as :id)
app.get("/api/boxes/export-db", handleExportDb);
app.use("/api/boxes", boxesRouter);
app.use("/api/location-profiles", locationProfilesRouter);
app.use("/api/activity-logs", activityLogsRouter);
app.use("/api/auth", authRouter);
app.use("/api/personnel", personnelRouter);
app.use("/api/checkouts", checkoutsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CCRO Archive Locator API is running" });
});

// Global error handler (must be registered after routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
