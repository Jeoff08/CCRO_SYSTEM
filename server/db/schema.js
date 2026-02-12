import db from "./connection.js";

/**
 * Create all tables and indexes if they don't already exist.
 */
export function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

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

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_boxes_cert_year ON boxes(certificate_type, year);
    CREATE INDEX IF NOT EXISTS idx_boxes_location ON boxes(bay, shelf, row);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
  `);
}
