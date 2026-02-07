import { describe, it, expect, beforeAll } from "vitest";
import type { ApiClient } from "../client/api-client.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { UserSchema } from "../contracts/schemas.ts";
import type { UserDTO } from "../contracts/types.ts";

describe("GET /v1/dashboard", () => {
  let client: ApiClient;

  beforeAll(async () => {
    const ctx = await createTestContext("DashboardTestUser");
    client = ctx.client;
  });

  it("should return 200", async () => {
    const { status } = await client.get<UserDTO>("/v1/dashboard");
    expect(status).toBe(200);
  });

  it("should match the UserDTO schema", async () => {
    const { data } = await client.get<UserDTO>("/v1/dashboard");
    const result = UserSchema.safeParse(data);

    if (!result.success) {
      console.error("Schema validation errors:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("should have non-negative numeric values", async () => {
    const { data } = await client.get<UserDTO>("/v1/dashboard");

    expect(data.sustainabilityScore).toBeGreaterThanOrEqual(0);
    expect(data.streakDays).toBeGreaterThanOrEqual(0);
    expect(data.today.walkKm).toBeGreaterThanOrEqual(0);
    expect(data.today.ptTrips).toBeGreaterThanOrEqual(0);
    expect(data.today.carKm).toBeGreaterThanOrEqual(0);
  });

  it("should return a valid lion state", async () => {
    const { data } = await client.get<UserDTO>("/v1/dashboard");

    expect(["sad", "neutral", "happy"]).toContain(data.lion.mood);
    expect(["sleeping", "idle", "walking", "riding"]).toContain(
      data.lion.activityMode,
    );
    expect(Array.isArray(data.lion.accessories)).toBe(true);
    expect(data.lion.coins).toBeGreaterThanOrEqual(0);
  });
});
