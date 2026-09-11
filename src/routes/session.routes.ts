import { Router } from "express";
import { db } from "../database.js";
import {
  dogNotFoundResponse,
  invalidRequestBodyResponse,
  sessionNotFoundResponse,
} from "./route-helpers.js";
import {
  buildSessionListQuery,
  getSessionFilters,
} from "./session-list-helpers.js";
import { createTrainingSessionSchema, updateTrainingSessionSchema } from "../schemas/session.schema.js";

export const sessionRouter = Router();

const sessionSelect = `
  SELECT 
    id,
    dog_id AS dogId,
    date,
    activity,
    duration_minutes AS durationMinutes,
    notes,
    progress,
    focus_next_time AS focusNextTime
  FROM training_sessions
`;

const getSessionById = (id: string | number | bigint) => {
  return db.prepare(`
    ${sessionSelect}
    WHERE id = ?
  `).get(id);
};

sessionRouter.get("/", (request, response) => {
  const filters = getSessionFilters(request.query, response);

  if (!filters) {
    return;
  }

  const { query, params } = buildSessionListQuery(sessionSelect, filters);
  const sessions = db.prepare(query).all(...params);

  return response.status(200).json(sessions);
});

sessionRouter.get("/:id", (request, response) => {
  const session = getSessionById(request.params.id);

  if (!session) {
    return sessionNotFoundResponse(response);
  }

  return response.status(200).json(session);
});

sessionRouter.post("/", (request, response) => {
  const validationResult = createTrainingSessionSchema.safeParse(request.body);

  if (!validationResult.success) {
    return invalidRequestBodyResponse(
      response,
      validationResult.error.flatten().fieldErrors,
    );
  }

  const { dogId, date, activity, durationMinutes, notes, progress, focusNextTime } = validationResult.data;

  const dog = db
    .prepare("SELECT id FROM dogs WHERE id = ?")
    .get(dogId);

  if (!dog) {
    return dogNotFoundResponse(response);
  }

  const result = db.prepare(`
    INSERT INTO training_sessions (
      dog_id,
      date,
      activity,
      duration_minutes,
      notes,
      progress,
      focus_next_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    dogId,
    date,
    activity,
    durationMinutes,
    notes ?? null,
    progress ?? null,
    focusNextTime ?? null,
  );

  const session = getSessionById(result.lastInsertRowid);

  return response.status(201).json(session);
});

sessionRouter.patch("/:id", (request, response) => {
  const validationResult = updateTrainingSessionSchema.safeParse(request.body);

  if (!validationResult.success) {
    return invalidRequestBodyResponse(
      response,
      validationResult.error.flatten().fieldErrors,
    );
  }

  const {
    dogId,
    date,
    activity,
    durationMinutes,
    notes,
    progress,
    focusNextTime,
  } = validationResult.data;

  const result = db.prepare(`
    UPDATE training_sessions
    SET
      dog_id = COALESCE(?, dog_id),
      date = COALESCE(?, date),
      activity = COALESCE(?, activity),
      duration_minutes = COALESCE(?, duration_minutes),
      notes = COALESCE(?, notes),
      progress = COALESCE(?, progress),
      focus_next_time = COALESCE(?, focus_next_time)
    WHERE id = ?
  `).run(
    dogId ?? null,
    date ?? null,
    activity ?? null,
    durationMinutes ?? null,
    notes ?? null,
    progress ?? null,
    focusNextTime ?? null,
    request.params.id,
  );

  if (result.changes === 0) {
    return sessionNotFoundResponse(response);
  }

  const updatedSession = getSessionById(request.params.id);

  return response.status(200).json(updatedSession);
});


sessionRouter.delete("/:id", (request, response) => {
  const result = db
    .prepare("DELETE FROM training_sessions WHERE id = ?")
    .run(request.params.id);

  if (result.changes === 0) {
    return sessionNotFoundResponse(response);
  }

  return response.status(204).send();
});
