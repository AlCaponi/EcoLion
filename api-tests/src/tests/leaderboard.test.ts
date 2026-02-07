import { describe, it, expect, beforeAll } from "vitest";
import { createApiClient, type ApiClient } from "../client/api-client.ts";
import { registerAnonymousUser } from "../client/auth.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { LeaderboardSchema } from "../contracts/schemas.ts";
import type {
  LeaderboardDTO,
  StartActivityResponseDTO,
  StopActivityResponseDTO,
} from "../contracts/types.ts";

const API_BASE_URL = process.env["API_BASE_URL"] ?? "http://localhost:8080";

describe("GET /v1/leaderboard", () => {
  let client: ApiClient;
  let userOneId: string;
  let userTwoId: string;
  let userOneScore = 0;
  let userTwoScore = 0;

  beforeAll(async () => {
    const ctx = await createTestContext("LeaderboardTestUser");
    client = ctx.client;

    const userOneClient = createApiClient({ baseUrl: API_BASE_URL });
    const userTwoClient = createApiClient({ baseUrl: API_BASE_URL });

    ({ userId: userOneId } = await registerAnonymousUser(
      userOneClient,
      "LeaderboardUserOne",
    ));
    ({ userId: userTwoId } = await registerAnonymousUser(
      userTwoClient,
      "LeaderboardUserTwo",
    ));

    const startedOneA = await userOneClient.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "walk", startTime: "2023-10-27T10:00:00Z" },
    );
    const stoppedOneA = await userOneClient.post<StopActivityResponseDTO>(
      "/v1/activity/stop",
      { activityId: startedOneA.data.activityId, stopTime: "2023-10-27T10:30:00Z" },
    );
    const startedOneB = await userOneClient.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "bike", startTime: "2023-10-27T11:00:00Z" },
    );
    const stoppedOneB = await userOneClient.post<StopActivityResponseDTO>(
      "/v1/activity/stop",
      { activityId: startedOneB.data.activityId, stopTime: "2023-10-27T11:20:00Z" },
    );
    userOneScore =
      stoppedOneA.data.co2SavedKg + stoppedOneB.data.co2SavedKg;

    const startedTwo = await userTwoClient.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "transit", startTime: "2023-10-27T12:00:00Z" },
    );
    const stoppedTwo = await userTwoClient.post<StopActivityResponseDTO>(
      "/v1/activity/stop",
      { activityId: startedTwo.data.activityId, stopTime: "2023-10-27T13:00:00Z" },
    );
    userTwoScore = stoppedTwo.data.co2SavedKg;
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

  it("should have unique user IDs", async () => {
    const { data } = await client.get<LeaderboardDTO>("/v1/leaderboard");
    const ids = data.users.map((entry) => entry.user.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should return ranked users with scores", async () => {
    const { data } = await client.get<LeaderboardDTO>("/v1/leaderboard");

    expect(Array.isArray(data.users)).toBe(true);
    for (let i = 0; i < data.users.length; i++) {
      const entry = data.users[i]!;
      expect(entry.rank).toBe(i + 1);
      expect(entry.user.id).toBeTruthy();
      expect(entry.user.displayName).toBeTruthy();
      expect(entry.score).toBeGreaterThanOrEqual(0);
      if (i > 0) {
        expect(entry.score).toBeLessThanOrEqual(data.users[i - 1]!.score);
      }
    }
  });

  it("should aggregate activity scores per user", async () => {
    const { data } = await client.get<LeaderboardDTO>("/v1/leaderboard");
    const entryOne = data.users.find((entry) => entry.user.id === userOneId);
    const entryTwo = data.users.find((entry) => entry.user.id === userTwoId);

    expect(entryOne).toBeTruthy();
    expect(entryTwo).toBeTruthy();
    expect(entryOne!.score).toBeCloseTo(userOneScore, 3);
    expect(entryTwo!.score).toBeCloseTo(userTwoScore, 3);
  });
});
