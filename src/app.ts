import express from "express";
import { db } from "./database.js";

const app = express();

app.use(express.json());

app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
});

app.get("/dogs", (_request, response) => {
    const dogs = db
    .prepare("SELECT id, name, breed FROM dogs ORDER BY id")
    .all();

    response.status(200).json(dogs);
});

app.get("/dogs/:id", (request, response) => {
    const dog = db
    .prepare("SELECT id, name, breed FROM dogs WHERE id = ?")
    .get(request.params.id);

    response.status(200).json(dog);
});

app.post("/dogs", (request, response) => {
    const { name, breed } = request.body;

    const result = db
    .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
    .run(name, breed);

    const dog = db
    .prepare("SELECT id, name, breed FROM dogs WHERE id = ?")
    .get(result.lastInsertRowid);

    response.status(201).json(dog);
});

export default app;