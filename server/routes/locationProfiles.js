import express from "express";
import { randomUUID } from "crypto";
import db from "../db/index.js";
import { transformProfile } from "../lib/transforms.js";

const router = express.Router();

// Get all location profiles
router.get("/", (req, res) => {
  try {
    const profiles = db
      .prepare(
        "SELECT * FROM location_profiles ORDER BY is_active DESC, updated_at DESC"
      )
      .all();
    res.json(profiles.map(transformProfile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active location profile
router.get("/active", (req, res) => {
  try {
    const profile = db
      .prepare("SELECT * FROM location_profiles WHERE is_active = 1 LIMIT 1")
      .get();
    if (!profile)
      return res.status(404).json({ error: "No active profile found" });
    res.json(transformProfile(profile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get location profile by ID
router.get("/:id", (req, res) => {
  try {
    const profile = db
      .prepare("SELECT * FROM location_profiles WHERE id = ?")
      .get(req.params.id);
    if (!profile)
      return res.status(404).json({ error: "Profile not found" });
    res.json(transformProfile(profile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update location profile
router.post("/", (req, res) => {
  try {
    const { id, name, shelfLettersByBay, rowLabels } = req.body;
    const profileId = id || randomUUID();

    const existing = db
      .prepare("SELECT id FROM location_profiles WHERE id = ?")
      .get(profileId);

    if (existing) {
      db.prepare(
        `UPDATE location_profiles SET
        name = ?, shelf_letters_by_bay = ?, row_labels = ?, updated_at = datetime('now')
        WHERE id = ?`
      ).run(
        name,
        JSON.stringify(shelfLettersByBay),
        JSON.stringify(rowLabels),
        profileId
      );
    } else {
      db.prepare(
        `INSERT INTO location_profiles (id, name, shelf_letters_by_bay, row_labels)
        VALUES (?, ?, ?, ?)`
      ).run(
        profileId,
        name,
        JSON.stringify(shelfLettersByBay),
        JSON.stringify(rowLabels)
      );
    }

    const savedProfile = db
      .prepare("SELECT * FROM location_profiles WHERE id = ?")
      .get(profileId);
    res.status(201).json(transformProfile(savedProfile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set active profile
router.put("/:id/active", (req, res) => {
  try {
    db.prepare("UPDATE location_profiles SET is_active = 0").run();
    const result = db
      .prepare("UPDATE location_profiles SET is_active = 1 WHERE id = ?")
      .run(req.params.id);
    if (result.changes === 0)
      return res.status(404).json({ error: "Profile not found" });

    const activeProfile = db
      .prepare("SELECT * FROM location_profiles WHERE id = ?")
      .get(req.params.id);
    res.json(transformProfile(activeProfile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete location profile
router.delete("/:id", (req, res) => {
  try {
    const count = db
      .prepare("SELECT COUNT(*) as count FROM location_profiles")
      .get();
    if (count.count <= 1) {
      return res
        .status(400)
        .json({ error: "Cannot delete the last profile" });
    }

    const result = db
      .prepare("DELETE FROM location_profiles WHERE id = ?")
      .run(req.params.id);
    if (result.changes === 0)
      return res.status(404).json({ error: "Profile not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
