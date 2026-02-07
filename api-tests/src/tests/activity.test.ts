import { describe, it, expect, beforeAll } from "vitest";
import type { ApiClient } from "../client/api-client.ts";
import { createTestContext } from "../helpers/test-context.ts";
import {
  StartActivityResponseSchema,
  StopActivityResponseSchema,
  GetActivityResponseSchema,
} from "../contracts/schemas.ts";
import type {
  StartActivityResponseDTO,
  StopActivityResponseDTO,
  GetActivityResponseDTO,
} from "../contracts/types.ts";

describe("POST /v1/activity/start", () => {
  let client: ApiClient;

  beforeAll(async () => {
    const ctx = await createTestContext("ActivityStartTestUser");
    client = ctx.client;
  });

  it("should return 200", async () => {
    const { status } = await client.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "walk", startTime: "2023-10-27T10:00:00Z" },
    );
    expect(status).toBe(200);
  });

  it("should match the StartActivityResponseDTO schema", async () => {
    const { data } = await client.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "bike", startTime: "2023-10-27T11:00:00Z" },
    );
    const result = StartActivityResponseSchema.safeParse(data);

    if (!result.success) {
      console.error("Schema validation errors:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("should return a running state", async () => {
    const { data } = await client.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "transit", startTime: "2023-10-27T12:00:00Z" },
    );
    expect(data.state).toBe("running");
    expect(data.activityId).toBeGreaterThan(0);
  });

  it("should return 400 when activityType is missing", async () => {
    const { status } = await client.post("/v1/activity/start", {
      startTime: "2023-10-27T10:00:00Z",
    });
    expect(status).toBe(400);
  });

  it("should return 400 when startTime is missing", async () => {
    const { status } = await client.post("/v1/activity/start", {
      activityType: "walk",
    });
    expect(status).toBe(400);
  });
});

describe("POST /v1/activity/stop", () => {
  let client: ApiClient;
  let activityId: number;

  beforeAll(async () => {
    const ctx = await createTestContext("ActivityStopTestUser");
    client = ctx.client;

    // Start an activity first so we can stop it
    const { data } = await client.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "walk", startTime: "2023-10-27T10:00:00Z" },
    );
    activityId = data.activityId;
  });

  it("should return 200", async () => {
    const { status } = await client.post<StopActivityResponseDTO>(
      "/v1/activity/stop",
      { activityId, stopTime: "2023-10-27T10:30:00Z" },
    );
    expect(status).toBe(200);
  });

  it("should match the StopActivityResponseDTO schema", async () => {
    // Start a new activity to stop
    const { data: started } = await client.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "bike", startTime: "2023-10-27T11:00:00Z" },
    );

    const { data } = await client.post<StopActivityResponseDTO>(
      "/v1/activity/stop",
      { activityId: started.activityId, stopTime: "2023-10-27T11:45:00Z" },
    );
    const result = StopActivityResponseSchema.safeParse(data);

    if (!result.success) {
      console.error("Schema validation errors:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("should return stopped state with metrics", async () => {
    const { data: started } = await client.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "transit", startTime: "2023-10-27T14:00:00Z" },
    );

    const { data } = await client.post<StopActivityResponseDTO>(
      "/v1/activity/stop",
      { activityId: started.activityId, stopTime: "2023-10-27T14:20:00Z" },
    );
    expect(data.state).toBe("stopped");
    expect(data.durationSeconds).toBeGreaterThanOrEqual(0);
    expect(data.xpEarned).toBeGreaterThanOrEqual(0);
    expect(data.co2SavedKg).toBeGreaterThanOrEqual(0);
  });

  it("should return 400 when activityId is missing", async () => {
    const { status } = await client.post("/v1/activity/stop", {
      stopTime: "2023-10-27T10:30:00Z",
    });
    expect(status).toBe(400);
  });

  it("should return 404 for a non-existent activity", async () => {
    const { status } = await client.post("/v1/activity/stop", {
      activityId: 999999,
      stopTime: "2023-10-27T10:30:00Z",
    });
    expect(status).toBe(404);
  });
});

describe("GET /v1/activity/:activityId", () => {
  let client: ApiClient;
  let activityId: number;

  beforeAll(async () => {
    const ctx = await createTestContext("ActivityGetTestUser");
    client = ctx.client;

    // Start and stop an activity so we can fetch it
    const { data: started } = await client.post<StartActivityResponseDTO>(
      "/v1/activity/start",
      { activityType: "walk", startTime: "2023-10-27T10:00:00Z" },
    );
    activityId = started.activityId;

    await client.post<StopActivityResponseDTO>("/v1/activity/stop", {
      activityId,
      stopTime: "2023-10-27T10:30:00Z",
    });
  });

  it("should return 200", async () => {
    const { status } = await client.get<GetActivityResponseDTO>(
      `/v1/activity/${activityId}`,
    );
    expect(status).toBe(200);
  });

  it("should match the GetActivityResponseDTO schema", async () => {
    const { data } = await client.get<GetActivityResponseDTO>(
      `/v1/activity/${activityId}`,
    );
    const result = GetActivityResponseSchema.safeParse(data);

    if (!result.success) {
      console.error("Schema validation errors:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("should return correct activity data", async () => {
    const { data } = await client.get<GetActivityResponseDTO>(
      `/v1/activity/${activityId}`,
    );
    expect(data.activityId).toBe(activityId);
    expect(["running", "paused", "stopped"]).toContain(data.state);
    expect(data.durationSeconds).toBeGreaterThanOrEqual(0);
    expect(data.xpEarned).toBeGreaterThanOrEqual(0);
    expect(data.co2SavedKg).toBeGreaterThanOrEqual(0);
  });

  it("should return 404 for a non-existent activity", async () => {
    const { status } = await client.get("/v1/activity/999999");
    expect(status).toBe(404);
  });
});
