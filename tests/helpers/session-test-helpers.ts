import { db } from "../../src/database.js";
import { createDog } from "./dog-test-helpers.js";

type SessionDefaults = {
  date: string;
  activity: string;
  durationMinutes: number;
};

export const createSession = (
  dogId: number,
  overrides: Partial<SessionDefaults> = {},
) => {
  const session = {
    date: "2026-09-07",
    activity: "Agility",
    durationMinutes: 30,
    ...overrides,
  };

  return db
    .prepare(`
      INSERT INTO training_sessions (
      dog_id,
      date,
      activity,
      duration_minutes)
      VALUES (?, ?, ?, ?)`)
    .run(
      dogId,
      session.date,
      session.activity,
      session.durationMinutes,
    );
};

export const buildFullSessionData = () => ({
  date: "2026-09-07",
  activity: "Agility",
  durationMinutes: 30,
  notes: "Bra energi",
  progress: "Säkrare i slalomen",
  focusNextTime: "Träna lugna starter",
});

export const buildBasicSessionResponse = (
  id: number,
  dogId: number,
  overrides: Partial<SessionDefaults> = {},
) => {
  const session = {
    date: "2026-09-07",
    activity: "Agility",
    durationMinutes: 30,
    ...overrides,
  };

  return {
    id,
    dogId,
    date: session.date,
    activity: session.activity,
    durationMinutes: session.durationMinutes,
    notes: null,
    progress: null,
    focusNextTime: null,
  };
};

export { createDog };
