import { type Response } from "express";

export const invalidQueryParamResponse = (response: Response) => {
  return response.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid query parameters",
    },
  });
};

export const invalidRequestBodyResponse = (
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

export const dogNotFoundResponse = (response: Response) => {
  return response.status(404).json({
    error: {
      code: "DOG_NOT_FOUND",
      message: "Dog not found",
    },
  });
};

export const sessionNotFoundResponse = (response: Response) => {
  return response.status(404).json({
    error: {
      code: "SESSION_NOT_FOUND",
      message: "Training session not found",
    },
  });
};

export const dogAlreadyExistsResponse = (response: Response) => {
  return response.status(409).json({
    error: {
      code: "DOG_ALREADY_EXISTS",
      message: "A dog with this name already exists",
    },
  });
};

export const parsePositiveInt = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const parsedValue = parseInt(value, 10);

  return Number.isNaN(parsedValue) ? null : parsedValue;
};
