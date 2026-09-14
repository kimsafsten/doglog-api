import request from "supertest";
import express from "express";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import { errorHandler } from "../src/middleware/error-handler.js";



describe("GET /health", () => {
    it("returns status 200 OK and API status", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });
});

describe("error handler", () => {
  it("returns status 500 and standard error response for unexpected errors", async () => {
    const testApp = express();

    testApp.get("/crash", () => {
      throw new Error("boom");
    });

    testApp.use(errorHandler);

    const response = await request(testApp).get("/crash");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  });
});
