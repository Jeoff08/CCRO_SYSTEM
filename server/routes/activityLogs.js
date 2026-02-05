import express from "express";
import { randomUUID } from "crypto";
import db from "../db.js";

const router = express.Router();

// Get all activity logs
router.get("/", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = db
      .prepare(
        "SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?"
      )
      .all(limit);

    // Parse details JSON if it's a string
    const parsedLogs = logs.map((log) => ({
      ...log,
      details: typeof log.details === "string" 
        ? (() => {
            try {
              return JSON.parse(log.details);
            } catch {
              return log.details;
            }
          })()
        : log.details,
    }));

    res.json(parsedLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create activity log
router.post("/", (req, res) => {
  try {
    const { userId, username, type, details, searchCode } = req.body;

    const logId = randomUUID();
    const detailsStr = typeof details === "string" 
      ? details 
      : JSON.stringify(details);

    db.prepare(
      `INSERT INTO activity_logs (id, user_id, username, type, details, search_code, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).run(
      logId,
      userId || null,
      username || null,
      type,
      detailsStr,
      searchCode || null
    );

    const newLog = db.prepare("SELECT * FROM activity_logs WHERE id = ?").get(logId);
    
    // Parse details
    let parsedDetails = newLog.details;
    try {
      parsedDetails = JSON.parse(newLog.details);
    } catch {
      // Keep as string if not valid JSON
    }

    res.status(201).json({
      ...newLog,
      details: parsedDetails,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity logs by user
router.get("/user/:userId", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = db
      .prepare(
        "SELECT * FROM activity_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?"
      )
      .all(req.params.userId, limit);

    const parsedLogs = logs.map((log) => ({
      ...log,
      details: typeof log.details === "string" 
        ? (() => {
            try {
              return JSON.parse(log.details);
            } catch {
              return log.details;
            }
          })()
        : log.details,
    }));

    res.json(parsedLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all activity logs
router.delete("/", (req, res) => {
  try {
    db.prepare("DELETE FROM activity_logs").run();
    res.json({ message: "All activity logs cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

