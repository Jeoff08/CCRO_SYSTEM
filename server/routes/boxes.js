import express from "express";
import { randomUUID } from "crypto";
import db from "../db/index.js";
import { transformBox } from "../lib/transforms.js";

const router = express.Router();

// Get all boxes
router.get("/", (req, res) => {
  try {
    const boxes = db
      .prepare("SELECT * FROM boxes ORDER BY box_number, bay, shelf, row")
      .all();
    res.json(boxes.map(transformBox));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get box by ID
router.get("/:id", (req, res) => {
  try {
    const box = db
      .prepare("SELECT * FROM boxes WHERE id = ?")
      .get(req.params.id);
    if (!box) return res.status(404).json({ error: "Box not found" });
    res.json(transformBox(box));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create box
router.post("/", (req, res) => {
  try {
    const {
      id,
      certificateType,
      year,
      yearTo,
      monthIndex,
      monthIndexTo,
      boxNumber,
      bay,
      shelf,
      row,
      registryRange,
      remark,
    } = req.body;

    const boxId = id || randomUUID();
    db.prepare(
      `INSERT INTO boxes (
        id, certificate_type, year, year_to, month_index, month_index_to,
        box_number, bay, shelf, row, registry_range, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      boxId,
      certificateType,
      year,
      yearTo || null,
      monthIndex,
      monthIndexTo || null,
      boxNumber,
      bay,
      shelf,
      row,
      registryRange || null,
      remark || null
    );

    const newBox = db.prepare("SELECT * FROM boxes WHERE id = ?").get(boxId);
    res.status(201).json(transformBox(newBox));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update box
router.put("/:id", (req, res) => {
  try {
    const {
      certificateType,
      year,
      yearTo,
      monthIndex,
      monthIndexTo,
      boxNumber,
      bay,
      shelf,
      row,
      registryRange,
      remark,
    } = req.body;

    const result = db
      .prepare(
        `UPDATE boxes SET
        certificate_type = ?, year = ?, year_to = ?, month_index = ?, month_index_to = ?,
        box_number = ?, bay = ?, shelf = ?, row = ?, registry_range = ?, remark = ?,
        updated_at = datetime('now')
        WHERE id = ?`
      )
      .run(
        certificateType,
        year,
        yearTo || null,
        monthIndex,
        monthIndexTo || null,
        boxNumber,
        bay,
        shelf,
        row,
        registryRange || null,
        remark || null,
        req.params.id
      );

    if (result.changes === 0)
      return res.status(404).json({ error: "Box not found" });

    const updatedBox = db
      .prepare("SELECT * FROM boxes WHERE id = ?")
      .get(req.params.id);
    res.json(transformBox(updatedBox));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete box
router.delete("/:id", (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM boxes WHERE id = ?")
      .run(req.params.id);
    if (result.changes === 0)
      return res.status(404).json({ error: "Box not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
