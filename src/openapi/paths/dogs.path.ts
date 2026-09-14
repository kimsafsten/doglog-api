export const dogPaths = {
  "/dogs": {
    get: {
      summary: "Get all dogs",
      responses: {
        "200": {
          description: "List of dogs",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Dog",
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: "Create a dog",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateDogInput",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Dog created",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Dog",
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
  "/dogs/{id}": {
    get: {
      summary: "Get one dog by id",
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
          description: "Dog found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Dog",
              },
            },
          },
        },
        "404": {
          description: "Dog not found",
        },
      },
    },
    patch: {
      summary: "Update a dog",
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
              $ref: "#/components/schemas/UpdateDogInput",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Dog updated",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Dog",
              },
            },
          },
        },
        "404": {
          description: "Dog not found",
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
      summary: "Delete a dog",
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
          description: "Dog deleted",
        },
        "404": {
          description: "Dog not found",
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
