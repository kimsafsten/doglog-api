export const healthPath = {
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
};
