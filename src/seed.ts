import type Database from "better-sqlite3";

export const seedDatabase = (db: Database.Database) => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const dogCountResult = db
    .prepare("SELECT COUNT(*) as count FROM dogs")
    .get() as { count: number };

  if (dogCountResult.count > 0) {
    return;
  }

  const insertSeedData = db.transaction(() => {
    const luna = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

    const milo = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Milo", "Labrador");

    db.prepare(`
      INSERT INTO training_sessions (
        dog_id,
        date,
        activity,
        duration_minutes,
        notes,
        progress,
        focus_next_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      luna.lastInsertRowid,
      "2026-09-07",
      "Agility",
      30,
      "Bra fokus",
      "Säkrare i slalom",
      "Träna starter",
    );

    db.prepare(`
      INSERT INTO training_sessions (
        dog_id,
        date,
        activity,
        duration_minutes,
        notes,
        progress,
        focus_next_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      luna.lastInsertRowid,
      "2026-09-09",
      "Rallylydnad",
      25,
      "Fin följsamhet",
      "Bättre vänstersvängar",
      "Träna tempo",
    );

    db.prepare(`
      INSERT INTO training_sessions (
        dog_id,
        date,
        activity,
        duration_minutes,
        notes,
        progress,
        focus_next_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      milo.lastInsertRowid,
      "2026-09-08",
      "Obedience",
      20,
      "Lugn och fin",
      "Bättre sitt-stanna",
      "Träna inkallning",
    );

    db.prepare(`
      INSERT INTO training_sessions (
        dog_id,
        date,
        activity,
        duration_minutes,
        notes,
        progress,
        focus_next_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      milo.lastInsertRowid,
      "2026-09-10",
      "Nosework",
      15,
      "Jobbade noggrant",
      "Säkrare markering",
      "Träna uthållighet",
    );
  });

  insertSeedData();
};