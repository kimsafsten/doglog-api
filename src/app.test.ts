import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "./app.js";

import { db } from "./database.js";

beforeEach(() => {
  db.prepare("DELETE FROM dogs").run();
});

describe("GET /health", () => {
    it("returns status 200 OK and API status", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });
});

describe("POST /dogs", () => {
  it("creates a dog and returns status 201", async () => {
    const newDog = {
      name: "Luna",
      breed: "Border Collie",
    };

    const response = await request(app).post("/dogs").send(newDog);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: "Luna",
      breed: "Border Collie",
    });
  });
});

describe("GET /dogs", () => {
  it("returns all dogs", async () => {
    db.prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
    .run("Luna", "Border Collie");

    const response = await request(app).get("/dogs");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: expect.any(Number),
        name: "Luna",
        breed: "Border Collie",
      },
    ]);
  });
});

describe("GET /dogs/:id", () => {
  it("returns one dog by id", async () => {
    const result = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

    const response = await request(app).get(
      `/dogs/${result.lastInsertRowid}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: Number(result.lastInsertRowid),
      name: "Luna",
      breed: "Border Collie",
    });
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