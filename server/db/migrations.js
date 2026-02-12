import db from "./connection.js";

/**
 * Run data migrations that fix/upgrade existing data.
 */
export function runMigrations() {
  // Fix R-T → R-6 in existing location profiles
  const rows = db
    .prepare("SELECT id, row_labels FROM location_profiles")
    .all();
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
        db.prepare(
          "UPDATE location_profiles SET row_labels = ?, updated_at = datetime('now') WHERE id = ?"
        ).run(JSON.stringify(labels), row.id);
      }
    } catch {
      /* skip malformed rows */
    }
  }
}
