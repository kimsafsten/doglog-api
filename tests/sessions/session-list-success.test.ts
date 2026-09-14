import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { db } from "../../src/database.js";
import {
  buildBasicSessionResponse,
  buildFullSessionData,
  buildSessionListResponse,
  createDog,
  createSession,
} from "../helpers/session-test-helpers.js";
import { resetDatabase } from "../helpers/test-db.js";

resetDatabase();

describe("GET /sessions", () => {
  it("returns paginated training sessions with metadata by default", async () => {
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
    expect(response.body).toEqual(
      buildSessionListResponse(
        [
          {
            id: Number(session.lastInsertRowid),
            dogId: Number(dog.lastInsertRowid),
            ...fullSession,
          },
        ],
        {
          page: 1,
          limit: 10,
          total: 1,
        },
      ),
    );
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
    expect(response.body).toEqual(
      buildSessionListResponse(
        [
          buildBasicSessionResponse(
            Number(lunaSession.lastInsertRowid),
            Number(luna.lastInsertRowid),
          ),
        ],
        {
          page: 1,
          limit: 10,
          total: 1,
        },
      ),
    );
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
    expect(response.body).toEqual(
      buildSessionListResponse(
        [
          buildBasicSessionResponse(
            Number(agilitySession.lastInsertRowid),
            Number(dog.lastInsertRowid),
          ),
        ],
        {
          page: 1,
          limit: 10,
          total: 1,
        },
      ),
    );
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
    expect(response.body).toEqual(
      buildSessionListResponse(
        [
          buildBasicSessionResponse(
            Number(lunaAgilitySession.lastInsertRowid),
            Number(luna.lastInsertRowid),
          ),
        ],
        {
          page: 1,
          limit: 10,
          total: 1,
        },
      ),
    );
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
    expect(response.body).toEqual(
      buildSessionListResponse(
        [
          buildBasicSessionResponse(
            Number(session1.lastInsertRowid),
            Number(dog.lastInsertRowid),
            { date: "2026-09-08" },
          ),
        ],
        {
          page: 1,
          limit: 10,
          total: 1,
        },
      ),
    );
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
    expect(response.body).toEqual(
      buildSessionListResponse(
        [
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
        ],
        {
          page: 1,
          limit: 2,
          total: 3,
        },
      ),
    );
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
    expect(response.body).toEqual(
      buildSessionListResponse(
        [
          buildBasicSessionResponse(
            Number(session2.lastInsertRowid),
            Number(dog.lastInsertRowid),
            {
              date: "2026-09-09",
            },
          ),
        ],
        {
          page: 2,
          limit: 1,
          total: 3,
        },
      ),
    );
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
    expect(response.body).toEqual(
      buildSessionListResponse([], {
        page: 5,
        limit: 2,
        total: 3,
      }),
    );
  });

  it("returns page 1 with limit 10 and the total by default", async () => {
    const dog = createDog();

    for (let i = 0; i < 15; i++) {
      createSession(Number(dog.lastInsertRowid), {
        date: `2026-09-${(i + 1).toString().padStart(2, "0")}`,
      });
    }

    const response = await request(app).get("/sessions");

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(10);
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      totalPages: 2,
    });
  });
});
