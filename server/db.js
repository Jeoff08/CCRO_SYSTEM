import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In packaged Electron, CCRO_DB_PATH points to a writable userData location.
// In development, falls back to the project root.
const dbPath = process.env.CCRO_DB_PATH || join(__dirname, "..", "ccro-archive.db");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Initialize database schema
function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Boxes table
  db.exec(`
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
  `);

  // Location profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS location_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      shelf_letters_by_bay TEXT NOT NULL,
      row_labels TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Activity logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      username TEXT,
      type TEXT NOT NULL,
      details TEXT NOT NULL,
      search_code TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_boxes_cert_year ON boxes(certificate_type, year);
    CREATE INDEX IF NOT EXISTS idx_boxes_location ON boxes(bay, shelf, row);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
  `);

  // Insert default user if not exists
  const defaultUser = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get("admin");
  if (!defaultUser) {
    db.prepare(
      "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)"
    ).run(
      randomUUID(),
      "admin",
      "ccro123", // In production, this should be hashed
      "Records Officer"
    );
  }

  // Insert default location profile if not exists
  const defaultProfile = db
    .prepare("SELECT id FROM location_profiles WHERE name = ?")
    .get("Default mapping");
  if (!defaultProfile) {
    const defaultShelfLetters = {
      1: ["S-A", "S-B"],
      2: ["S-A", "S-C", "S-B", "S-D"],
      3: ["S-A", "S-C", "S-B", "S-D"],
      4: ["S-A", "S-C", "S-B", "S-D"],
      5: ["S-A", "S-C", "S-B", "S-D"],
      6: ["S-A", "S-B"],
    };
    const defaultRowLabels = {
      1: "R-1",
      2: "R-2",
      3: "R-3",
      4: "R-4",
      5: "R-5",
      6: "R-6",
    };

    db.prepare(
      "INSERT INTO location_profiles (id, name, shelf_letters_by_bay, row_labels, is_active) VALUES (?, ?, ?, ?, ?)"
    ).run(
      randomUUID(),
      "Default mapping",
      JSON.stringify(defaultShelfLetters),
      JSON.stringify(defaultRowLabels),
      1
    );
  }
}

initDatabase();

// Migration: fix R-T → R-6 in existing location profiles
(function migrateRowLabels() {
  const rows = db.prepare("SELECT id, row_labels FROM location_profiles").all();
  for (const row of rows) {
    try {
      const labels = JSON.parse(row.row_labels);
      let changed = false;
      for (const key of Object.keys(labels)) {
        if (labels[key] === "R-T") {
          labels[key] = "R-6";
          changed = true;
        }
      }
      if (changed) {
        db.prepare("UPDATE location_profiles SET row_labels = ?, updated_at = datetime('now') WHERE id = ?")
          .run(JSON.stringify(labels), row.id);
      }
    } catch { /* skip malformed rows */ }
  }
})();

export default db;

