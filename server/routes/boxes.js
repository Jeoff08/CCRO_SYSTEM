import express from "express";
import { randomUUID } from "crypto";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import Database from "better-sqlite3";
import db from "../db/index.js";
import { transformBox } from "../lib/transforms.js";

const router = express.Router();

const BOXES_TABLE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS boxes (
    id TEXT PRIMARY KEY,
    certificate_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    year_to INTEGER,
    month_index INTEGER NOT NULL,
    month_index_to INTEGER,
    box_number INTEGER NOT NULL,
    bay INTEGER NOT NULL,
    shelf INTEGER NOT NULL,
    row INTEGER NOT NULL,
    registry_range TEXT,
    remark TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

// Export box management only as a .db file (GET /api/boxes/export-db)
// Handler is registered on the main app in index.js so it always wins over GET /:id
export function handleExportDb(req, res) {
  let tempPath = null;
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
    tempPath = join(tmpdir(), `ccro-box-management-${timestamp}.db`);
    const exportDb = new Database(tempPath);
    exportDb.exec(BOXES_TABLE_SCHEMA);
    const rows = db.prepare("SELECT * FROM boxes ORDER BY box_number, bay, shelf, row").all();
    const insert = exportDb.prepare(
      `INSERT INTO boxes (
        id, certificate_type, year, year_to, month_index, month_index_to,
        box_number, bay, shelf, row, registry_range, remark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const row of rows) {
      insert.run(
        row.id,
        row.certificate_type,
        row.year,
        row.year_to,
        row.month_index,
        row.month_index_to,
        row.box_number,
        row.bay,
        row.shelf,
        row.row,
        row.registry_range,
        row.remark,
        row.created_at,
        row.updated_at
      );
    }
    exportDb.close();
    const buffer = readFileSync(tempPath);
    unlinkSync(tempPath);
    tempPath = null;
    const filename = `ccro-box-management_${timestamp}.db`;
    res.setHeader("Content-Type", "application/vnd.sqlite3");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    if (tempPath && existsSync(tempPath)) {
      try {
        unlinkSync(tempPath);
      } catch (_) {}
    }
    res.status(500).json({ error: error.message });
  }
}

// Import box management from a .db file (POST /api/boxes/import-db) — body: { data: base64 }
router.post("/import-db", (req, res) => {
  let tempPath = null;
  try {
    const { data: base64 } = req.body || {};
    if (!base64 || typeof base64 !== "string") {
      return res.status(400).json({ error: "Missing or invalid body: { data: base64 string }" });
    }
    const buffer = Buffer.from(base64, "base64");
    const timestamp = Date.now();
    tempPath = join(tmpdir(), `ccro-box-import-${timestamp}.db`);
    writeFileSync(tempPath, buffer);
    const importDb = new Database(tempPath, { readonly: true });
    const tableInfo = importDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='boxes'").get();
    if (!tableInfo) {
      importDb.close();
      unlinkSync(tempPath);
      return res.status(400).json({ error: "Uploaded file has no 'boxes' table. Use a Box management export .db file." });
    }
    const rows = importDb.prepare("SELECT * FROM boxes").all();
    importDb.close();
    unlinkSync(tempPath);
    tempPath = null;

    db.prepare("DELETE FROM boxes").run();
    const insert = db.prepare(
      `INSERT INTO boxes (
        id, certificate_type, year, year_to, month_index, month_index_to,
        box_number, bay, shelf, row, registry_range, remark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const now = new Date().toISOString();
    for (const row of rows) {
      insert.run(
        row.id ?? randomUUID(),
        row.certificate_type ?? "COLB",
        row.year ?? 0,
        row.year_to ?? null,
        row.month_index ?? 0,
        row.month_index_to ?? null,
        row.box_number ?? 0,
        row.bay ?? 1,
        row.shelf ?? 1,
        row.row ?? 1,
        row.registry_range ?? null,
        row.remark ?? null,
        row.created_at ?? now,
        row.updated_at ?? now
      );
    }
    res.json({ imported: rows.length, message: `Imported ${rows.length} box(es) into Box management.` });
  } catch (error) {
    if (tempPath && existsSync(tempPath)) {
      try {
        unlinkSync(tempPath);
      } catch (_) {}
    }
    res.status(500).json({ error: error.message });
  }
});

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
