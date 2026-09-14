export const schemas = {
  Dog: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "Luna" },
      breed: { type: "string", example: "Border Collie" },
    },
  },
  CreateDogInput: {
    type: "object",
    required: ["name", "breed"],
    properties: {
      name: { type: "string", example: "Luna" },
      breed: { type: "string", example: "Border Collie" },
    },
  },
  UpdateDogInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Luna" },
      breed: { type: "string", example: "Border Collie" },
    },
  },
  Session: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      dogId: { type: "integer", example: 1 },
      date: { type: "string", example: "2026-09-07" },
      activity: { type: "string", example: "Agility" },
      durationMinutes: { type: "integer", example: 30 },
      notes: { type: "string", example: "Bra energi" },
      progress: { type: "string", example: "Säkrare i slalomen" },
      focusNextTime: { type: "string", example: "Träna lugna starter" },
    },
  },
  Pagination: {
    type: "object",
    properties: {
      page: { type: "integer", example: 1 },
      limit: { type: "integer", example: 10 },
      total: { type: "integer", example: 42 },
      totalPages: { type: "integer", example: 5 },
    },
  },
  SessionListResponse: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Session",
        },
      },
      pagination: {
        $ref: "#/components/schemas/Pagination",
      },
    },
  },
  CreateSessionInput: {
    type: "object",
    required: ["dogId", "date", "activity", "durationMinutes"],
    properties: {
      dogId: { type: "integer", example: 1 },
      date: { type: "string", example: "2026-09-07" },
      activity: { type: "string", example: "Agility" },
      durationMinutes: { type: "integer", example: 30 },
      notes: { type: "string", example: "Bra energi" },
      progress: { type: "string", example: "Säkrare i slalomen" },
      focusNextTime: { type: "string", example: "Träna lugna starter" },
    },
  },
  UpdateSessionInput: {
    type: "object",
    properties: {
      dogId: { type: "integer", example: 1 },
      date: { type: "string", example: "2026-09-07" },
      activity: { type: "string", example: "Agility" },
      durationMinutes: { type: "integer", example: 30 },
      notes: { type: "string", example: "Bra energi" },
      progress: { type: "string", example: "Säkrare i slalomen" },
      focusNextTime: { type: "string", example: "Träna lugna starter" },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "INTERNAL_SERVER_ERROR" },
          message: {
            type: "string",
            example: "An unexpected error occurred.",
          },
        },
      },
    },
  },
};
