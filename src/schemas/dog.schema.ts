import { z } from "zod";

export const createDogSchema = z.object({
  name: z.string().trim().min(1).max(100),
  breed: z.string().trim().min(1).max(100),
});