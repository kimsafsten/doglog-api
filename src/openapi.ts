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
                    },
                },
            },
            post: {
                summary: "Create a dog",
                responses: {
                    "201": {
                        description: "Dog created",
                    },
                },
            },
        },
    },
};