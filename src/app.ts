import express from "express";
import { db } from "./database.js";
import { createDogSchema } from "./schemas/dog.schema.js";

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

  if (!dog) {
    return response.status(404).json({
      error: {
        code: "DOG_NOT_FOUND",
        message: "Dog not found",
      },
    });
  }

  return response.status(200).json(dog);
});

app.post("/dogs", (request, response) => {
    const validationResult = createDogSchema.safeParse(request.body);

    if (!validationResult.success) {
    return response.status(400).json({
        error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: validationResult.error.flatten().fieldErrors,
        },
    });
    }

    const { name, breed } = validationResult.data;

    const existingDog = db
        .prepare("SELECT id FROM dogs WHERE name = ? COLLATE NOCASE")
        .get(name);

    if (existingDog) {
        return response.status(409).json({
        error: {
            code: "DOG_ALREADY_EXISTS",
            message: "A dog with this name already exists",
        },
        });
    }

    const result = db
    .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
    .run(name, breed);

    const dog = db
    .prepare("SELECT id, name, breed FROM dogs WHERE id = ?")
    .get(result.lastInsertRowid);

    return response.status(201).json(dog);
});

export default app;