import { z } from "zod";

export const createTrainingSessionSchema = z.object({
  dogId: z.number().int().positive(),
  date: z.iso.date(),
  activity: z.string().trim().min(1).max(100),
  durationMinutes: z.number().int().positive(),
  notes: z.string().trim().max(1000).optional(),
  progress: z.string().trim().max(1000).optional(),
  focusNextTime: z.string().trim().max(1000).optional(),
});

export const updateTrainingSessionSchema =
  createTrainingSessionSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    },
  );
