import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../src/app.js";
import { db } from "../src/database.js";

beforeEach(() => {
  db.prepare("DELETE FROM training_sessions").run();
  db.prepare("DELETE FROM dogs").run();
});

const createDog = (name = "Luna", breed = "Border Collie") => {
  return db
    .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
    .run(name, breed);
};

const createSession = (dogId: number, date: string, activity: string, durationMinutes: number) => {
  return db
    .prepare(`INSERT INTO training_sessions (dog_id, date, activity, duration_minutes) VALUES (?, ?, ?, ?)`)
    .run(dogId, date, activity, durationMinutes);
};

const buildFullSessionData = () => ({
  date: "2026-09-07",
  activity: "Agility",
  durationMinutes: 30,
  notes: "Bra energi",
  progress: "Säkrare i slalomen",
  focusNextTime: "Träna lugna starter",
});

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

describe("GET /sessions", () => {
  it("returns all training sessions", async () => {
    const dog = createDog();

    const fullSession = buildFullSessionData();

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
      fullSession.date,
      fullSession.activity,
      fullSession.durationMinutes,
      fullSession.notes,
      fullSession.progress,
      fullSession.focusNextTime
    );

    const response = await request(app).get("/sessions");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: Number(session.lastInsertRowid),
        dogId: Number(dog.lastInsertRowid),
        ...fullSession,
      },
    ]);
  });

  it("filters training sessions by dogId", async () => {
    const luna = createDog();
    const milo = createDog("Milo", "Labrador");

    const lunaSession = createSession(
      Number(luna.lastInsertRowid),
      "2026-09-08",
      "Agility",
      30);

    createSession(
      Number(milo.lastInsertRowid),
      "2026-09-08",
      "Lydnad",
      20
    );

    const response = await request(app)
      .get("/sessions")
      .query({ dogId: Number(luna.lastInsertRowid) });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: Number(lunaSession.lastInsertRowid),
        dogId: Number(luna.lastInsertRowid),
        date: "2026-09-08",
        activity: "Agility",
        durationMinutes: 30,
        notes: null,
        progress: null,
        focusNextTime: null,
      },
    ]);
  });

  it("filters training sessions by activity", async () => {
    const dog = createDog();

    const agilitySession = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-08",
      "Agility",
      30);

    const obedienceSession = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-09",
      "Obedience",
      20
    );

    const response = await request(app)
      .get("/sessions")
      .query({ activity: "Agility" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: Number(agilitySession.lastInsertRowid),
        dogId: Number(dog.lastInsertRowid),
        date: "2026-09-08",
        activity: "Agility",
        durationMinutes: 30,
        notes: null,
        progress: null,
        focusNextTime: null,
      },
    ]);
  });

  it("combines dogId and activity filters", async () => {
    const luna = createDog();
    const milo = createDog("Milo", "Labrador");

    const lunaAgilitySession = createSession(
      Number(luna.lastInsertRowid),
      "2026-09-08",
      "Agility",
      30,
    );

    createSession(
      Number(luna.lastInsertRowid),
      "2026-09-09",
      "Obedience",
      20,
    );

    createSession(
      Number(milo.lastInsertRowid),
      "2026-09-10",
      "Agility",
      25,
    );

    const response = await request(app)
      .get("/sessions")
      .query({
        dogId: Number(luna.lastInsertRowid),
        activity: "Agility",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: Number(lunaAgilitySession.lastInsertRowid),
        dogId: Number(luna.lastInsertRowid),
        date: "2026-09-08",
        activity: "Agility",
        durationMinutes: 30,
        notes: null,
        progress: null,
        focusNextTime: null,
      },
    ]);
  });

  it("filters training sessions by date", async () => {
    const dog = createDog();

    const session1 = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-08",
      "Agility",
      30);

    const session2 = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-09",
      "Obedience",
      20
    );

    const response = await request(app)
      .get("/sessions")
      .query({ date: "2026-09-08" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: Number(session1.lastInsertRowid),
        dogId: Number(dog.lastInsertRowid),
        date: "2026-09-08",
        activity: "Agility",
        durationMinutes: 30,
        notes: null,
        progress: null,
        focusNextTime: null,
      },
    ]);
  });

  it("limits the number of returned training sessions", async () => {
    const dog = createDog();

    const session1 = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-08",
      "Agility",
      30
    );

    const session2 = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-09",
      "Obedience",
      20
    );

    const session3 = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-10",
      "Rally",
      25
    );

    const response = await request(app)
      .get("/sessions")
      .query({ limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: Number(session3.lastInsertRowid),
        dogId: Number(dog.lastInsertRowid),
        date: "2026-09-10",
        activity: "Rally",
        durationMinutes: 25,
        notes: null,
        progress: null,
        focusNextTime: null,
      },
      {
        id: Number(session2.lastInsertRowid),
        dogId: Number(dog.lastInsertRowid),
        date: "2026-09-09",
        activity: "Obedience",
        durationMinutes: 20,
        notes: null,
        progress: null,
        focusNextTime: null,
      },
    ]);
  });

  it("paginates the returned training sessions", async () => {
    const dog = createDog();

    const session1 = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-08",
      "Agility",
      30
    );

    const session2 = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-09",
      "Obedience",
      20
    );

    const session3 = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-10",
      "Rally",
      25
    );

    const response = await request(app)
      .get("/sessions")
      .query({ page: 2, limit: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: Number(session2.lastInsertRowid),
        dogId: Number(dog.lastInsertRowid),
        date: "2026-09-09",
        activity: "Obedience",
        durationMinutes: 20,
        notes: null,
        progress: null,
        focusNextTime: null,
      }
    ]);
  });

  it("returns an empty array when page is outside the result set", async () => {
    const dog = createDog();

    for (let i = 0; i < 3; i++) {
      createSession(
        Number(dog.lastInsertRowid),
        `2026-09-${(i + 8).toString().padStart(2, "0")}`,
        "Agility",
        30,
      );
    }

    const response = await request(app)
      .get("/sessions")
      .query({ page: 5, limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns status 400 when limit is invalid", async () => {
    const response = await request(app)
      .get("/sessions")
      .query({ limit: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
      },
    });
  });

  it("returns status when page is invalid", async () => {
    const response = await request(app)
      .get("/sessions")
      .query({ page: "invalid", limit: 1 });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
      },
    });
  });

  it("returns 10 sessions by default when no limit is provided", async () => {
    const dog = createDog();

    for (let i = 0; i < 15; i++) {
      createSession(
        Number(dog.lastInsertRowid),
        `2026-09-${(i + 1).toString().padStart(2, "0")}`,
        "Agility",
        30
      );
    }

    const response = await request(app).get("/sessions");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(10);
  });

  it("returns status 400 when date is invalid", async () => {
    const response = await request(app)
      .get("/sessions")
      .query({ date: "invalid-date" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
      },
    });
  });

  it("returns status 400 when dogId is invalid", async () => {
    const response = await request(app)
      .get("/sessions")
      .query({ dogId: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
      },
    });
  });

  it("returns status when activity is empty", async () => {
    const response = await request(app)
      .get("/sessions")
      .query({ activity: "" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
      },
    });
  });

  it("returns status 400 when activity is only whitespace", async () => {
    const response = await request(app)
      .get("/sessions")
      .query({ activity: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
      },
    });
  });
});

describe("GET /sessions/:id", () => {
  it("returns one training session by id", async () => {
    const dog = createDog();

    const session = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-07",
      "Agility",
      30
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
    const dog = createDog();

    const session = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-07",
      "Agility",
      30
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

  it("returns status 400 when durationMinutes is invalid", async () => {
    const dog = createDog();

    const session = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-07",
      "Agility",
      30,
    );

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

    const session = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-07",
      "Agility",
      30
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

    const session = createSession(
      Number(dog.lastInsertRowid),
      "2026-09-08",
      "Agility",
      30
    );

    await request(app).delete(`/sessions/${session.lastInsertRowid}`);

    const existingDog = db
      .prepare("SELECT id FROM dogs WHERE id = ?")
      .get(dog.lastInsertRowid);

    expect(existingDog).toBeDefined();
  });
});
