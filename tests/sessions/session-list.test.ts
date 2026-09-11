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
      fullSession.focusNextTime,
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

    const lunaSession = createSession(Number(luna.lastInsertRowid));
    createSession(Number(milo.lastInsertRowid));

    const response = await request(app)
      .get("/sessions")
      .query({ dogId: Number(luna.lastInsertRowid) });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      buildBasicSessionResponse(
        Number(lunaSession.lastInsertRowid),
        Number(luna.lastInsertRowid),
      ),
    ]);
  });

  it("filters training sessions by activity", async () => {
    const dog = createDog();
    const agilitySession = createSession(Number(dog.lastInsertRowid));

    createSession(Number(dog.lastInsertRowid), {
      activity: "Obedience",
    });

    const response = await request(app)
      .get("/sessions")
      .query({ activity: "Agility" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      buildBasicSessionResponse(
        Number(agilitySession.lastInsertRowid),
        Number(dog.lastInsertRowid),
      ),
    ]);
  });

  it("combines dogId and activity filters", async () => {
    const luna = createDog();
    const milo = createDog("Milo", "Labrador");

    const lunaAgilitySession = createSession(Number(luna.lastInsertRowid));

    createSession(Number(luna.lastInsertRowid), {
      activity: "Obedience",
    });

    createSession(Number(milo.lastInsertRowid), {});

    const response = await request(app)
      .get("/sessions")
      .query({
        dogId: Number(luna.lastInsertRowid),
        activity: "Agility",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      buildBasicSessionResponse(
        Number(lunaAgilitySession.lastInsertRowid),
        Number(luna.lastInsertRowid),
      ),
    ]);
  });

  it("filters training sessions by date", async () => {
    const dog = createDog();

    const session1 = createSession(Number(dog.lastInsertRowid), {
      date: "2026-09-08",
    });

    createSession(Number(dog.lastInsertRowid), {
      date: "2026-09-09",
    });

    const response = await request(app)
      .get("/sessions")
      .query({ date: "2026-09-08" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      buildBasicSessionResponse(
        Number(session1.lastInsertRowid),
        Number(dog.lastInsertRowid),
        { date: "2026-09-08" },
      ),
    ]);
  });

  it("limits the number of returned training sessions", async () => {
    const dog = createDog();

    createSession(Number(dog.lastInsertRowid), {
      date: "2026-09-08",
    });

    const session2 = createSession(Number(dog.lastInsertRowid), {
      date: "2026-09-09",
    });

    const session3 = createSession(Number(dog.lastInsertRowid), {
      date: "2026-09-10",
    });

    const response = await request(app)
      .get("/sessions")
      .query({ limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      buildBasicSessionResponse(
        Number(session3.lastInsertRowid),
        Number(dog.lastInsertRowid),
        {
          date: "2026-09-10",
        },
      ),
      buildBasicSessionResponse(
        Number(session2.lastInsertRowid),
        Number(dog.lastInsertRowid),
        {
          date: "2026-09-09",
        },
      ),
    ]);
  });

  it("paginates the returned training sessions", async () => {
    const dog = createDog();

    const session2 = createSession(Number(dog.lastInsertRowid), {
      date: "2026-09-09",
    });

    createSession(Number(dog.lastInsertRowid), {
      date: "2026-09-08",
    });

    createSession(Number(dog.lastInsertRowid), {
      date: "2026-09-10",
    });

    const response = await request(app)
      .get("/sessions")
      .query({ page: 2, limit: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      buildBasicSessionResponse(
        Number(session2.lastInsertRowid),
        Number(dog.lastInsertRowid),
        {
          date: "2026-09-09",
        },
      ),
    ]);
  });

  it("returns an empty array when page is outside the result set", async () => {
    const dog = createDog();

    for (let i = 0; i < 3; i++) {
      createSession(Number(dog.lastInsertRowid), {
        date: `2026-09-${(i + 8).toString().padStart(2, "0")}`,
      });
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

  it("returns status 400 when page is invalid", async () => {
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
      createSession(Number(dog.lastInsertRowid), {
        date: `2026-09-${(i + 1).toString().padStart(2, "0")}`,
      });
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

  it("returns status 400 when activity is empty", async () => {
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
