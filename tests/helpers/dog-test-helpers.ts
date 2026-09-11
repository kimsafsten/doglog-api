import { db } from "../../src/database.js";

export const buildDogData = (
  overrides: Partial<{ name: string; breed: string }> = {},
) => ({
  name: "Luna",
  breed: "Border Collie",
  ...overrides,
});

export const createDog = (
  name = "Luna",
  breed = "Border Collie",
) => {
  return db
    .prepare("INSERT INTO dogs (name, breed) VALUES (?, ?)")
    .run(name, breed);
};

export const buildDogResponse = (
  id: number,
  overrides: Partial<{ name: string; breed: string }> = {},
) => ({
  id,
  ...buildDogData(overrides),
});
