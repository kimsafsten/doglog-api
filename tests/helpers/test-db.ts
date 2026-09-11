import { beforeEach } from "vitest";

import { db } from "../../src/database.js";

export const resetDatabase = () => {
  beforeEach(() => {
    db.prepare("DELETE FROM training_sessions").run();
    db.prepare("DELETE FROM dogs").run();
  });
};
