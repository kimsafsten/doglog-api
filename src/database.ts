import Database from "better-sqlite3";

const databaseFile =
    process.env.NODE_ENV === "test" ? ":memory:" : "doglog.db";

export const db = new Database(databaseFile);

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS dogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        breed TEXT NOT NULL
    )
`);