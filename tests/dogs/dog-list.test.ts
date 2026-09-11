import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { db } from "../../src/database.js";
import {
  buildDogResponse,
  createDog,
} from "../helpers/dog-test-helpers.js";

beforeEach(() => {
  db.prepare("DELETE FROM training_sessions").run();
  db.prepare("DELETE FROM dogs").run();
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
