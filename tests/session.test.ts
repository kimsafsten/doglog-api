import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../src/app.js";
import { db } from "../src/database.js";

beforeEach(() => {
  db.prepare("DELETE FROM training_sessions").run();
  db.prepare("DELETE FROM dogs").run();
});

describe("POST /sessions", () => {
  it("creates a training session and returns status 201", async () => {
    const dog = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

    const newSession = {
      dogId: Number(dog.lastInsertRowid),
      date: "2026-09-07",
      activity: "Agility",
      durationMinutes: 30,
      notes: "Bra energi",
      progress: "Säkrare i slalomen",
      focusNextTime: "Träna lugna starter",
    };

    const response = await request(app)
      .post("/sessions")
      .send(newSession);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      ...newSession,
    });
  });

  it("returns status 404 when dog does not exist", async () => {
    const response = await request(app)
      .post("/sessions")
      .send({
        dogId: 999999,
        date: "2026-09-07",
        activity: "Agility",
        durationMinutes: 30,
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "DOG_NOT_FOUND",
        message: "Dog not found",
      },
    });
  });
});

describe("GET /sessions", () => {
  it("returns all training sessions", async () => {
    const dog = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

    const session = db.prepare(`
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
      dog.lastInsertRowid,
      "2026-09-07",
      "Agility",
      30,
      "Bra energi",
      "Säkrare i slalomen",
      "Träna lugna starter",
    );

    const response = await request(app).get("/sessions");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: Number(session.lastInsertRowid),
        dogId: Number(dog.lastInsertRowid),
        date: "2026-09-07",
        activity: "Agility",
        durationMinutes: 30,
        notes: "Bra energi",
        progress: "Säkrare i slalomen",
        focusNextTime: "Träna lugna starter",
      },
    ]);
  });
});

describe("GET /sessions/:id", () => {
  it("returns one training session by id", async () => {
    const dog = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

    const session = db.prepare(`
      INSERT INTO training_sessions (
        dog_id,
        date,
        activity,
        duration_minutes
      )
      VALUES (?, ?, ?, ?)
    `).run(
      dog.lastInsertRowid,
      "2026-09-07",
      "Agility",
      30,
    );

    const response = await request(app).get(
      `/sessions/${session.lastInsertRowid}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: Number(session.lastInsertRowid),
      dogId: Number(dog.lastInsertRowid),
      date: "2026-09-07",
      activity: "Agility",
      durationMinutes: 30,
      notes: null,
      progress: null,
      focusNextTime: null,
    });
  });

  it("returns status 404 when session does not exist", async () => {
    const response = await request(app).get("/sessions/999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "SESSION_NOT_FOUND",
        message: "Training session not found",
      },
    });
  });
});

describe("PATCH /sessions/:id", () => {
  it("partially updates an existing training session", async () => {
    const dog = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

    const session = db.prepare(`
      INSERT INTO training_sessions (
        dog_id,
        date,
        activity,
        duration_minutes
      )
      VALUES (?, ?, ?, ?)
    `).run(
      dog.lastInsertRowid,
      "2026-09-07",
      "Agility",
      30,
    );

    const response = await request(app)
      .patch(`/sessions/${session.lastInsertRowid}`)
      .send({
        progress: "Säkrare i slalomen",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: Number(session.lastInsertRowid),
      dogId: Number(dog.lastInsertRowid),
      date: "2026-09-07",
      activity: "Agility",
      durationMinutes: 30,
      notes: null,
      progress: "Säkrare i slalomen",
      focusNextTime: null,
    });
  });

  it("returns status 404 when session does not exist", async () => {
    const response = await request(app)
      .patch("/sessions/999999")
      .send({
        progress: "Säkrare i slalomen",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "SESSION_NOT_FOUND",
        message: "Training session not found",
      },
    });
  });

  it("returns status 400 when no fields are provided", async () => {
    const response = await request(app)
      .patch("/sessions/999999")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
      },
    });
  });
});

describe("DELETE /sessions/:id", () => {
  it("deletes an existing training session", async () => {
    const dog = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

    const session = db.prepare(`
      INSERT INTO training_sessions (
        dog_id,
        date,
        activity,
        duration_minutes
      )
      VALUES (?, ?, ?, ?)
    `).run(
      dog.lastInsertRowid,
      "2026-09-07",
      "Agility",
      30,
    );

    const response = await request(app).delete(
      `/sessions/${session.lastInsertRowid}`,
    );

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const deletedSession = db
      .prepare("SELECT id FROM training_sessions WHERE id = ?")
      .get(session.lastInsertRowid);

    expect(deletedSession).toBeUndefined();
  });
});