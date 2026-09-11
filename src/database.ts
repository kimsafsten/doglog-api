import Database from "better-sqlite3";
import { seedDatabase } from "./seed.js";

const databaseFile =
    process.env.NODE_ENV === "test" ? ":memory:" : "doglog.db";

export const db = new Database(databaseFile);

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS dogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        breed TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS training_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dog_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        activity TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        notes TEXT,
        progress TEXT,
        focus_next_time TEXT,
        FOREIGN KEY (dog_id) REFERENCES dogs(id) ON DELETE CASCADE
    )
`);

seedDatabase(db);