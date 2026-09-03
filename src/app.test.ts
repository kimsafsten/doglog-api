import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "./app.js";

describe("GET /health", () => {
    it("should return status 200 OK and API status", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });
});