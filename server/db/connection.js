import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In packaged Electron, CCRO_DB_PATH points to a writable userData location.
// In development, falls back to the project root.
const dbPath =
  process.env.CCRO_DB_PATH || join(__dirname, "..", "..", "ccro-archive.db");

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

export default db;
