import { type Response, Router } from "express";
import { db } from "../database.js";
import { createDogSchema, updateDogSchema } from "../schemas/dog.schema.js";

export const dogRouter = Router();

const dogSelect = `
  SELECT id, name, breed
  FROM dogs
`;

const invalidRequestBodyResponse = (
  response: Response,
  details: Record<string, string[] | undefined>,
) => {
  return response.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid request body",
      details,
    },
  });
};

const dogNotFoundResponse = (response: Response) => {
  return response.status(404).json({
    error: {
      code: "DOG_NOT_FOUND",
      message: "Dog not found",
    },
  });
};

const dogAlreadyExistsResponse = (response: Response) => {
  return response.status(409).json({
    error: {
      code: "DOG_ALREADY_EXISTS",
      message: "A dog with this name already exists",
    },
  });
};

const getDogById = (id: string | number | bigint) => {
  return db.prepare(`
    ${dogSelect}
    WHERE id = ?
  `).get(id);
};

const getDogByName = (name: string) => {
  return db
    .prepare("SELECT id FROM dogs WHERE name = ? COLLATE NOCASE")
    .get(name);
};

dogRouter.get("/", (_request, response) => {
  const dogs = db
    .prepare(`
      ${dogSelect}
      ORDER BY id
    `)
    .all();

  response.status(200).json(dogs);
});

dogRouter.get("/:id", (request, response) => {
  const dog = getDogById(request.params.id);

  if (!dog) {
    return dogNotFoundResponse(response);
  }

  return response.status(200).json(dog);
});

dogRouter.post("/", (request, response) => {
  const validationResult = createDogSchema.safeParse(request.body);

  if (!validationResult.success) {
    return invalidRequestBodyResponse(
      response,
      validationResult.error.flatten().fieldErrors,
    );
  }

  const { name, breed } = validationResult.data;

  const existingDog = getDogByName(name);

  if (existingDog) {
    return dogAlreadyExistsResponse(response);
  }

  const result = db
    .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
    .run(name, breed);

  const dog = getDogById(result.lastInsertRowid);

  return response.status(201).json(dog);
});

dogRouter.patch("/:id", (request, response) => {
  const validationResult = updateDogSchema.safeParse(request.body);

  if (!validationResult.success) {
    return invalidRequestBodyResponse(
      response,
      validationResult.error.flatten().fieldErrors,
    );
  }

  const { name, breed } = validationResult.data;

  if (name !== undefined) {
    const duplicateDog = db
      .prepare(`
        SELECT id
        FROM dogs
        WHERE name = ? COLLATE NOCASE
          AND id != ?
      `)
      .get(name, request.params.id);

    if (duplicateDog) {
      return dogAlreadyExistsResponse(response);
    }
  }

  const result = db
    .prepare(`
      UPDATE dogs
      SET
        name = COALESCE(?, name),
        breed = COALESCE(?, breed)
      WHERE id = ?
    `)
    .run(
      name ?? null,
      breed ?? null,
      request.params.id,
    );

  if (result.changes === 0) {
    return dogNotFoundResponse(response);
  }

  const dog = getDogById(request.params.id);

  return response.status(200).json(dog);
});

dogRouter.delete("/:id", (request, response) => {
  const result = db
    .prepare("DELETE FROM dogs WHERE id = ?")
    .run(request.params.id);

  if (result.changes === 0) {
    return dogNotFoundResponse(response);
  }

  return response.status(204).send({});
});
