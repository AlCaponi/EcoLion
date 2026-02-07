import { describe, it, expect, beforeAll } from "vitest";
import type { ApiClient } from "../client/api-client.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { LeaderboardSchema } from "../contracts/schemas.ts";
import type { LeaderboardDTO } from "../contracts/types.ts";

describe("GET /v1/leaderboard", () => {
  let client: ApiClient;

  beforeAll(async () => {
    const ctx = await createTestContext("LeaderboardTestUser");
    client = ctx.client;
  });

  it("should return 200", async () => {
    const { status } = await client.get<LeaderboardDTO>("/v1/leaderboard");
    expect(status).toBe(200);
  });

  it("should match the LeaderboardDTO schema", async () => {
    const { data } = await client.get<LeaderboardDTO>("/v1/leaderboard");
    const result = LeaderboardSchema.safeParse(data);

    if (!result.success) {
      console.error("Schema validation errors:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("should have quartiers sorted by rank", async () => {
    const { data } = await client.get<LeaderboardDTO>("/v1/leaderboard");

    for (let i = 1; i < data.quartiers.length; i++) {
      expect(data.quartiers[i]!.rank).toBeGreaterThanOrEqual(
        data.quartiers[i - 1]!.rank,
      );
    }
  });

  it("should have unique quartier IDs", async () => {
    const { data } = await client.get<LeaderboardDTO>("/v1/leaderboard");
    const ids = data.quartiers.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have unique friend IDs", async () => {
    const { data } = await client.get<LeaderboardDTO>("/v1/leaderboard");
    const ids = data.friends.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
