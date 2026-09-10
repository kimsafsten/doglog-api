import { type Request, type Response, Router } from "express";
import { db } from "../database.js";
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

const invalidQueryParamResponse = (response: Response) => {
    return response.status(400).json({
        error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
        },
    });
};

const getSessionFilters = (
    query: Request["query"],
    response: Response,
) => {
    const dogId =
        typeof query.dogId === "string"
            ? parseInt(query.dogId, 10)
            : null;

    if (dogId !== null && (isNaN(dogId) || dogId <= 0)) {
        invalidQueryParamResponse(response);
        return null;
    }

    const activity =
        typeof query.activity === "string"
            ? query.activity
            : null;

    if (activity !== null && activity.trim() === "") {
        invalidQueryParamResponse(response);
        return null;
    }

    const date =
        typeof query.date === "string"
            ? query.date
            : null;

    if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        invalidQueryParamResponse(response);
        return null;
    }

    const limit =
        typeof query.limit === "string"
            ? parseInt(query.limit, 10)
            : 10;

    if (isNaN(limit) || limit <= 0) {
        invalidQueryParamResponse(response);
        return null;
    }

    const page =
        typeof query.page === "string"
            ? parseInt(query.page, 10)
            : null;

    if (page !== null && (isNaN(page) || page <= 0)) {
        invalidQueryParamResponse(response);
        return null;
    }

    return {
        dogId,
        activity,
        date,
        limit,
        page,
    };
};


sessionRouter.get("/", (request, response) => {
    const filters = getSessionFilters(request.query, response);

    if (!filters) {
        return;
    }

    let query = `${sessionSelect}
        WHERE (? IS NULL OR dog_id = ?)
        AND (? IS NULL OR activity = ?)
        AND (? IS NULL OR date = ?)
        ORDER BY date DESC, id DESC
        `;

    const params: Array<string | number | null> = [
        filters.dogId,
        filters.dogId,
        filters.activity,
        filters.activity,
        filters.date,
        filters.date,
    ];

    query += `
    LIMIT ?
    `;
    params.push(filters.limit);

    if (filters.page !== null) {
        const offset = (filters.page - 1) * filters.limit;
        query += `
        OFFSET ?
        `;
        params.push(offset);
    }

    const sessions = db.prepare(query).all(...params);

    return response.status(200).json(sessions);
});

sessionRouter.get("/:id", (request, response) => {
    const session = db.prepare(`${sessionSelect}
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
        ${sessionSelect}
        WHERE id = ?
    `).get(result.lastInsertRowid);

    return response.status(201).json(session);
});

sessionRouter.patch("/:id", (request, response) => {
    const validationResult = updateTrainingSessionSchema.safeParse(request.body);

    if (!validationResult.success) {
        return response.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request body",
                details: validationResult.error.flatten().fieldErrors,
            },
        });
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
        ${sessionSelect}
        WHERE id = ?
    `).get(request.params.id);

    return response.status(200).json(updatedSession);
});


sessionRouter.delete("/:id", (request, response) => {
    const result = db
        .prepare("DELETE FROM training_sessions WHERE id = ?")
        .run(request.params.id);

    if (result.changes === 0) {
        return response.status(404).json({
            error: {
                code: "SESSION_NOT_FOUND",
                message: "Training session not found",
            },
        });
    }

    return response.status(204).send();
});
