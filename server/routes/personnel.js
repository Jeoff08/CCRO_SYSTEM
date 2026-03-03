import express from "express";
import { randomUUID } from "crypto";
import db from "../db/index.js";
import { transformPersonnel } from "../lib/transforms.js";

const router = express.Router();

// Get all personnel
router.get("/", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM personnel ORDER BY full_name ASC")
      .all();
    res.json(rows.map(transformPersonnel));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get personnel by personnel_id (for public E-log lookup)
router.get("/by-id/:personnelId", (req, res) => {
  try {
    const row = db
      .prepare("SELECT * FROM personnel WHERE personnel_id = ?")
      .get(req.params.personnelId);
    if (!row) return res.status(404).json({ error: "Personnel not found" });
    res.json(transformPersonnel(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create personnel
router.post("/", (req, res) => {
  try {
    const { personnelId, fullName } = req.body;
    if (!personnelId || typeof personnelId !== "string" || !personnelId.trim()) {
      return res.status(400).json({ error: "Personnel ID is required" });
    }
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }
    const id = randomUUID();
    const pid = String(personnelId).trim();
    const name = String(fullName).trim();

    db.prepare(
      "INSERT INTO personnel (id, personnel_id, full_name) VALUES (?, ?, ?)"
    ).run(id, pid, name);

    const row = db.prepare("SELECT * FROM personnel WHERE id = ?").get(id);
    res.status(201).json(transformPersonnel(row));
  } catch (error) {
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "A personnel with this ID already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete personnel
router.delete("/:id", (req, res) => {
  try {
    const result = db.prepare("DELETE FROM personnel WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Personnel not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
