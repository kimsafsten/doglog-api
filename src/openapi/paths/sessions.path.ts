export const sessionPaths = {
  "/sessions": {
    get: {
      summary: "Get training sessions",
      parameters: [
        {
          name: "dogId",
          in: "query",
          required: false,
          description: "Filter sessions by dog id",
          schema: {
            type: "integer",
          },
        },
        {
          name: "activity",
          in: "query",
          required: false,
          description: "Filter sessions by activity",
          schema: {
            type: "string",
          },
        },
        {
          name: "date",
          in: "query",
          required: false,
          description: "Filter sessions by date in YYYY-MM-DD format",
          schema: {
            type: "string",
            example: "2026-09-07",
          },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Limit the number of returned sessions. Defaults to 10",
          schema: {
            type: "integer",
            example: 10,
          },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number used together with limit. Defaults to 1",
          schema: {
            type: "integer",
            example: 1,
          },
        },
      ],
      responses: {
        "200": {
          description: "Paginated list of training sessions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SessionListResponse",
              },
            },
          },
        },
        "400": {
          description: "Invalid query parameters",
        },
      },
    },
    post: {
      summary: "Create a training session",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateSessionInput",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Training session created",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Session",
              },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/sessions/{id}": {
    get: {
      summary: "Get one training session by id",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
          },
        },
      ],
      responses: {
        "200": {
          description: "Training session found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Session",
              },
            },
          },
        },
        "404": {
          description: "Training session not found",
        },
      },
    },
    patch: {
      summary: "Update a training session",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateSessionInput",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Training session updated",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Session",
              },
            },
          },
        },
        "404": {
          description: "Training session not found",
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete a training session",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
          },
        },
      ],
      responses: {
        "204": {
          description: "Training session deleted",
        },
        "404": {
          description: "Training session not found",
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
};
