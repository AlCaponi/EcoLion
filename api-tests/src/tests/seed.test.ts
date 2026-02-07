import { describe, it, expect, beforeAll } from "vitest";
import type { ApiClient } from "../client/api-client.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { seedDatabase, cleanDatabase } from "../helpers/seed.ts";

/**
 * This "test" seeds the backend with fixture data.
 *
 * Run it standalone:  npm run test:seed
 * Run it first:       vitest run --testPathPattern seed
 *
 * It registers a user, then pushes all fixture data to the backend
 * via the admin/seed endpoint.
 */
describe("Database Seeding", () => {
  let client: ApiClient;

  beforeAll(async () => {
    const ctx = await createTestContext("SeedAdmin");
    client = ctx.client;
  });

  it("should clean the database", async () => {
    await expect(cleanDatabase(client)).resolves.not.toThrow();
  });

  it("should seed the database with fixture data", async () => {
    await expect(seedDatabase(client)).resolves.not.toThrow();
  });
});
