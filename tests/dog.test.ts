import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../src/app.js";
import { db } from "../src/database.js";
import {
  buildDogData,
  buildDogResponse,
  createDog,
} from "./helpers/dog-test-helpers.js";
import { createSession } from "./helpers/session-test-helpers.js";

beforeEach(() => {
  db.prepare("DELETE FROM dogs").run();
});


describe("POST /dogs", () => {
  it("creates a dog and returns status 201", async () => {
    const newDog = buildDogData();

    const response = await request(app).post("/dogs").send(newDog);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      ...newDog,
    });
  });

  it("returns status 409 when dog name already exists", async () => {
    await request(app).post("/dogs").send(buildDogData());

    const response = await request(app).post("/dogs").send({
      name: "luna",
      breed: "Border Collie",
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        code: "DOG_ALREADY_EXISTS",
        message: "A dog with this name already exists",
      },
    });
  });


  it("returns status 400 when name is missing", async () => {
    const response = await request(app).post("/dogs").send({
      breed: "Border Collie",
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
      },
    });
  });

  it("returns status 400 when name is empty", async () => {
    const response = await request(app).post("/dogs").send({
      name: "",
      breed: "Border Collie",
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
      },
    });
  });

  it("returns status 400 when name is only whitespace", async () => {
    const response = await request(app).post("/dogs").send({
      name: "   ",
      breed: "Border Collie",
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

describe("GET /dogs", () => {
  it("returns all dogs", async () => {
    const dog = createDog();

    const response = await request(app).get("/dogs");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      buildDogResponse(Number(dog.lastInsertRowid)),
    ]);
  });
});

describe("GET /dogs/:id", () => {
  it("returns one dog by id", async () => {
    const result = createDog();

    const response = await request(app).get(
      `/dogs/${result.lastInsertRowid}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      buildDogResponse(Number(result.lastInsertRowid)),
    );
  });

  it("returns status 404 when dog does not exist", async () => {
    const response = await request(app).get("/dogs/999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "DOG_NOT_FOUND",
        message: "Dog not found",
      },
    });
  });
});

describe("PATCH /dogs/:id", () => {
  it("updates an existing dog", async () => {
    const result = createDog();

    const response = await request(app)
      .patch(`/dogs/${result.lastInsertRowid}`)
      .send({
        breed: "Australian Shepherd",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      buildDogResponse(Number(result.lastInsertRowid), {
        breed: "Australian Shepherd",
      }),
    );
  });

  it("returns status 400 when no fields are provided", async () => {
    const result = createDog();

    const response = await request(app)
      .patch(`/dogs/${result.lastInsertRowid}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
      },
    });
  });

  it("returns status 409 when updated name already exists", async () => {
    createDog();

    const result = createDog("Milo", "Labrador");

    const response = await request(app)
      .patch(`/dogs/${result.lastInsertRowid}`)
      .send({
        name: "luna",
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        code: "DOG_ALREADY_EXISTS",
        message: "A dog with this name already exists",
      },
    });
  });

  it("returns status 400 when breed is empty", async () => {
    const result = createDog();

    const response = await request(app)
      .patch(`/dogs/${result.lastInsertRowid}`)
      .send({
        breed: "",
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

describe("DELETE /dogs/:id", () => {
  it("deletes an existing dog and returns status 204", async () => {
    const result = createDog();

    const response = await request(app).delete(
      `/dogs/${result.lastInsertRowid}`,
    );

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    const deletedDog = db
      .prepare("SELECT id FROM dogs WHERE id = ?")
      .get(result.lastInsertRowid);

    expect(deletedDog).toBeUndefined();
  });

  it("deletes the dog's training sessions", async () => {
    const dog = createDog();

    createSession(Number(dog.lastInsertRowid), {
      date: "2026-09-08",
    });

    await request(app).delete(`/dogs/${dog.lastInsertRowid}`);

    const sessions = db
      .prepare("SELECT id FROM training_sessions WHERE dog_id = ?")
      .all(dog.lastInsertRowid);

    expect(sessions).toEqual([]);
  });
});
