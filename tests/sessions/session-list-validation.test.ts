import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { resetDatabase } from "../helpers/test-db.js";

resetDatabase();

describe("GET /sessions query validation", () => {
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
