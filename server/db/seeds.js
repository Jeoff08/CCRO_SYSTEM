import { randomUUID } from "crypto";
import db from "./connection.js";

/**
 * Insert default records if they don't already exist.
 */
export function seedDefaults() {
  // Default admin user
  const defaultUser = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get("admin");
  if (!defaultUser) {
    db.prepare(
      "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)"
    ).run(randomUUID(), "admin", "ccro123", "Records Officer");
  }

  // Default location profile
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
