import { type Request, type Response } from "express";
import { z } from "zod";

import {
  invalidQueryParamResponse,
  parsePositiveInt,
} from "./route-helpers.js";

export type SessionFilters = {
  dogId: number | null;
  activity: string | null;
  date: string | null;
  limit: number;
  page: number;
};

const sessionDateQuerySchema = z.iso.date();

const buildSessionFilterClause = (filters: Omit<SessionFilters, "limit" | "page">) => {
  const query = `
    WHERE (? IS NULL OR dog_id = ?)
    AND (? IS NULL OR activity = ?)
    AND (? IS NULL OR date = ?)
  `;

  const params: Array<string | number | null> = [
    filters.dogId,
    filters.dogId,
    filters.activity,
    filters.activity,
    filters.date,
    filters.date,
  ];

  return { query, params };
};

export const getSessionFilters = (
  query: Request["query"],
  response: Response,
) => {
  const dogId = parsePositiveInt(query.dogId);

  if (
    query.dogId !== undefined
    && (dogId === null || dogId <= 0)
  ) {
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

  if (
    date !== null
    && !sessionDateQuerySchema.safeParse(date).success
  ) {
    invalidQueryParamResponse(response);
    return null;
  }

  const limit = query.limit === undefined
    ? 10
    : parsePositiveInt(query.limit);

  if (limit === null || limit <= 0) {
    invalidQueryParamResponse(response);
    return null;
  }

  const page = query.page === undefined
    ? 1
    : parsePositiveInt(query.page);

  if (page === null || page <= 0) {
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

export const buildSessionListQuery = (
  sessionSelect: string,
  filters: SessionFilters,
) => {
  const { query: filterClause, params: filterParams } = buildSessionFilterClause(filters);

  // Each filter uses a nullable predicate so one prepared query can handle many combinations.
  const query = `${sessionSelect}
    ${filterClause}
    ORDER BY date DESC, id DESC
    LIMIT ?
    OFFSET ?
  `;

  const params: Array<string | number | null> = [
    ...filterParams,
    filters.limit,
    (filters.page - 1) * filters.limit,
  ];

  return { query, params };
};

export const buildSessionCountQuery = (
  filters: SessionFilters,
) => {
  const { query: filterClause, params } = buildSessionFilterClause(filters);

  return {
    query: `
      SELECT COUNT(*) AS total
      FROM training_sessions
      ${filterClause}
    `,
    params,
  };
};
