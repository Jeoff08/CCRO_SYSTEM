import db from "./connection.js";
import { createSchema } from "./schema.js";
import { seedDefaults } from "./seeds.js";
import { runMigrations } from "./migrations.js";

// Initialize the database on import
createSchema();
seedDefaults();
runMigrations();

export default db;
