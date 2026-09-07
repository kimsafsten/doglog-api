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