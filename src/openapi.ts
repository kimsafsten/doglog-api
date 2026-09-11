export const openApiDocument = {
    openapi: "3.0.0",
    info: {
        title: "DogLog API",
        version: "1.0.0",
        description: "API for logging dogs and training sessions",
    },
    paths: {
        "/health": {
            get: {
                summary: "Check API status",
                responses: {
                    "200": {
                        description: "API is running",
                    },
                },
            },
        },
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
                },
            },
        },
        "/sessions": {
            get: {
                summary: "Get training sessions",
                responses: {
                    "200": {
                        description: "List of training sessions",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Session",
                                    },
                                },
                            },
                        },
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
                },
            },
        },
    },
    components: {
        schemas: {
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
        },
    },
};