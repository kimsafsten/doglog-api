import { z } from "zod";

export const createDogSchema = z.object({
  name: z.string().trim().min(1).max(100),
  breed: z.string().trim().min(1).max(100),
});

export const updateDogSchema = createDogSchema.partial().refine(
  (data) => data.name !== undefined || data.breed !== undefined,
  {
    message: "At least one field must be provided",
  },
);