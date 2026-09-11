import { type Request, type Response } from "express";

import {
  invalidQueryParamResponse,
  parsePositiveInt,
} from "./route-helpers.js";

export type SessionFilters = {
  dogId: number | null;
  activity: string | null;
  date: string | null;
  limit: number;
  page: number | null;
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

  if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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

  const page = parsePositiveInt(query.page);

  if (
    query.page !== undefined
    && (page === null || page <= 0)
  ) {
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
  let query = `${sessionSelect}
    WHERE (? IS NULL OR dog_id = ?)
    AND (? IS NULL OR activity = ?)
    AND (? IS NULL OR date = ?)
    ORDER BY date DESC, id DESC
    LIMIT ?
  `;

  const params: Array<string | number | null> = [
    filters.dogId,
    filters.dogId,
    filters.activity,
    filters.activity,
    filters.date,
    filters.date,
    filters.limit,
  ];

  if (filters.page !== null) {
    const offset = (filters.page - 1) * filters.limit;
    query += `
      OFFSET ?
    `;
    params.push(offset);
  }

  return { query, params };
};
