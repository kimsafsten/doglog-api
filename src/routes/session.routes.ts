import { Router } from "express";
import { db } from "../database.js";
import { createTrainingSessionSchema, updateTrainingSessionSchema } from "../schemas/session.schema.js";

export const sessionRouter = Router();

sessionRouter.get("/", (_request, response) => {
    const sessions = db.prepare(`
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
    ORDER BY date DESC, id DESC
  `).all();

    return response.status(200).json(sessions);
});

sessionRouter.get("/:id", (request, response) => {
    const session = db.prepare(`
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
    WHERE id = ?
  `).get(request.params.id);

    if (!session) {
        return response.status(404).json({
            error: {
                code: "SESSION_NOT_FOUND",
                message: "Training session not found",
            },
        });
    }

    return response.status(200).json(session);
});

sessionRouter.post("/", (request, response) => {
    const validationResult = createTrainingSessionSchema.safeParse(request.body);

    if (!validationResult.success) {
        return response.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request body",
                details: validationResult.error.flatten().fieldErrors,
            },
        });
    }

    const { dogId, date, activity, durationMinutes, notes, progress, focusNextTime } = validationResult.data;

    const dog = db
        .prepare("SELECT id FROM dogs WHERE id = ?")
        .get(dogId);

    if (!dog) {
        return response.status(404).json({
            error: {
                code: "DOG_NOT_FOUND",
                message: "Dog not found",
            },
        });
    }

    const result = db.prepare(`
        INSERT INTO training_sessions (
        dog_id, 
        date, 
        activity, 
        duration_minutes, 
        notes, progress, 
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

    const session = db.prepare(`
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
        WHERE id = ?
    `).get(result.lastInsertRowid);

    return response.status(201).json(session);
});

sessionRouter.patch("/:id", (request, response) => {
    const {
        dogId,
        date,
        activity,
        durationMinutes,
        notes,
        progress,
        focusNextTime
    } = updateTrainingSessionSchema.parse(request.body);

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
        request.params.id
    );

    if (result.changes === 0) {
        return response.status(404).json({
            error: {
                code: "SESSION_NOT_FOUND",
                message: "Training session not found",
            },
        });
    }

    const updatedSession = db.prepare(`
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
        WHERE id = ?
    `).get(request.params.id);

    return response.status(200).json(updatedSession);
});
