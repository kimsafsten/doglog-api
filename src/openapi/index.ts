import { dogPaths } from "./paths/dogs.path.js";
import { healthPath } from "./paths/health.path.js";
import { sessionPaths } from "./paths/sessions.path.js";
import { schemas } from "./schemas.js";

export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "DogLog API",
    version: "1.0.0",
    description: "API for logging dogs and training sessions",
  },
    // Paths describe endpoints, while reusable payload shapes live under components.schemas.
    paths: {
        ...healthPath,
        ...dogPaths,
        ...sessionPaths,
    },
    components: {
        schemas,
    },
};
