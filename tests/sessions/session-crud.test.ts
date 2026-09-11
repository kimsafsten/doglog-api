import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { db } from "../../src/database.js";
import {
  buildBasicSessionResponse,
  buildFullSessionData,
  createDog,
  createSession,
} from "../helpers/session-test-helpers.js";
import { resetDatabase } from "../helpers/test-db.js";

resetDatabase();

describe("POST /sessions", () => {
  it("creates a training session and returns status 201", async () => {
    const dog = createDog();

    const newSession = {
      dogId: Number(dog.lastInsertRowid),
      ...buildFullSessionData(),
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

  it("returns status 400 when activity is empty", async () => {
    const dog = createDog();

    const response = await request(app)
      .post("/sessions")
      .send({
        dogId: Number(dog.lastInsertRowid),
        date: "2026-09-07",
        activity: "",
        durationMinutes: 30,
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
      },
    });
  });
});

describe("GET /sessions/:id", () => {
  it("returns one training session by id", async () => {
    const dog = createDog();
    const session = createSession(Number(dog.lastInsertRowid));

    const response = await request(app).get(
      `/sessions/${session.lastInsertRowid}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      buildBasicSessionResponse(
        Number(session.lastInsertRowid),
        Number(dog.lastInsertRowid),
      ),
    );
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
    const dog = createDog();
    const session = createSession(Number(dog.lastInsertRowid));

    const response = await request(app)
      .patch(`/sessions/${session.lastInsertRowid}`)
      .send({
        progress: "Säkrare i slalomen",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...buildBasicSessionResponse(
        Number(session.lastInsertRowid),
        Number(dog.lastInsertRowid),
      ),
      progress: "Säkrare i slalomen",
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

  it("returns status 400 when durationMinutes is invalid", async () => {
    const dog = createDog();
    const session = createSession(Number(dog.lastInsertRowid));

    const response = await request(app)
      .patch(`/sessions/${session.lastInsertRowid}`)
      .send({
        durationMinutes: 0,
      });

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
    const dog = createDog();
    const session = createSession(Number(dog.lastInsertRowid));

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

  it("returns status 404 when session does not exist", async () => {
    const response = await request(app).delete("/sessions/999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "SESSION_NOT_FOUND",
        message: "Training session not found",
      },
    });
  });

  it("does not delete the dog when a session is deleted", async () => {
    const dog = createDog();
    const session = createSession(Number(dog.lastInsertRowid));

    await request(app).delete(`/sessions/${session.lastInsertRowid}`);

    const existingDog = db
      .prepare("SELECT id FROM dogs WHERE id = ?")
      .get(dog.lastInsertRowid);

    expect(existingDog).toBeDefined();
  });
});
