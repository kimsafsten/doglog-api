import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../src/app.js";
import { db } from "../src/database.js";

beforeEach(() => {
  db.prepare("DELETE FROM dogs").run();
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

  it("returns status 409 when dog name already exists", async () => {
    await request(app).post("/dogs").send({
      name: "Luna",
      breed: "Border Collie",
    });

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

describe("PATCH /dogs/:id", () => {
  it("updates an existing dog", async () => {
    const result = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

    const response = await request(app)
      .patch(`/dogs/${result.lastInsertRowid}`)
      .send({
        breed: "Australian Shepherd",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: Number(result.lastInsertRowid),
      name: "Luna",
      breed: "Australian Shepherd",
    });
  });

  it("returns status 400 when no fields are provided", async () => {
    const result = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

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
    db.prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)").run(
      "Luna",
      "Border Collie",
    );

    const result = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Milo", "Labrador");

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
});

describe("DELETE /dogs/:id", () => {
  it("deletes an existing dog and returns status 204", async () => {
    const result = db
      .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
      .run("Luna", "Border Collie");

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
});