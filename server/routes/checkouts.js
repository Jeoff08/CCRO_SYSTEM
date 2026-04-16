import express from "express";
import { randomUUID } from "crypto";
import db from "../db/index.js";
import { transformCheckout } from "../lib/transforms.js";

const router = express.Router();

// Get all active checkouts (not yet returned)
router.get("/", (req, res) => {
  try {
    const active = req.query.active !== "false";
    const sql = active
      ? "SELECT * FROM checkouts WHERE returned_at IS NULL ORDER BY created_at DESC"
      : "SELECT * FROM checkouts ORDER BY created_at DESC";
    const rows = db.prepare(sql).all();
    res.json(rows.map(transformCheckout));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active checkouts for a specific personnel ID (optional: only pending returns)
router.get("/by-personnel/:personnelId", (req, res) => {
  try {
    const pendingOnly = req.query.pendingReturn === "true";
    const sql = pendingOnly
      ? "SELECT * FROM checkouts WHERE personnel_id = ? AND returned_at IS NULL AND pending_return_at IS NOT NULL ORDER BY created_at DESC"
      : "SELECT * FROM checkouts WHERE personnel_id = ? AND returned_at IS NULL ORDER BY created_at DESC";
    const rows = db.prepare(sql).all(req.params.personnelId);
    res.json(rows.map(transformCheckout));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create checkout
router.post("/", (req, res) => {
  try {
    const {
      personnelId,
      personnelName,
      boxId,
      certType,
      registryRange,
      monthStr,
      yearStr,
      checkoutDate,
      checkoutTime,
    } = req.body;
    if (!personnelId || !boxId || !certType || !checkoutDate || !checkoutTime) {
      return res.status(400).json({
        error: "personnelId, boxId, certType, checkoutDate, checkoutTime are required",
      });
    }
    const id = randomUUID();
    db.prepare(
      `INSERT INTO checkouts (
        id, personnel_id, personnel_name, box_id, cert_type, registry_range,
        month_str, year_str, checkout_date, checkout_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      personnelId,
      personnelName || null,
      boxId,
      certType,
      registryRange || null,
      monthStr || null,
      yearStr || null,
      checkoutDate,
      checkoutTime
    );
    const row = db.prepare("SELECT * FROM checkouts WHERE id = ?").get(id);
    res.status(201).json(transformCheckout(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark checkout as returned (admin confirm); clears pending_return_at
router.patch("/:id/return", (req, res) => {
  try {
    const result = db
      .prepare(
        "UPDATE checkouts SET returned_at = datetime('now'), pending_return_at = NULL WHERE id = ? AND returned_at IS NULL"
      )
      .run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Checkout not found or already returned" });
    }
    const row = db.prepare("SELECT * FROM checkouts WHERE id = ?").get(req.params.id);
    res.json(transformCheckout(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit return (personnel): set pending_return_at so admin can confirm in Personnel Management
router.patch("/:id/submit-return", (req, res) => {
  try {
    const result = db
      .prepare(
        "UPDATE checkouts SET pending_return_at = datetime('now') WHERE id = ? AND returned_at IS NULL AND (pending_return_at IS NULL OR pending_return_at = '')"
      )
      .run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Checkout not found, already returned, or return already submitted" });
    }
    const row = db.prepare("SELECT * FROM checkouts WHERE id = ?").get(req.params.id);
    res.json(transformCheckout(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
