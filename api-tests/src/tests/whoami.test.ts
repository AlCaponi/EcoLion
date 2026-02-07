import { beforeAll, describe, expect, it } from "vitest";
import type { ApiClient } from "../client/api-client.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { WhoAmISchema } from "../contracts/schemas.ts";
import type { WhoAmIDTO } from "../contracts/types.ts";

describe("GET /v1/whoami", () => {
  let client: ApiClient;
  let expectedUserId: string;

  beforeAll(async () => {
    const ctx = await createTestContext("WhoAmITestUser");
    client = ctx.client;
    expectedUserId = ctx.userId;
  });

  it("should return 200", async () => {
    const { status } = await client.get<WhoAmIDTO>("/v1/whoami");
    expect(status).toBe(200);
  });

  it("should match the schema", async () => {
    const { data } = await client.get<WhoAmIDTO>("/v1/whoami");
    const result = WhoAmISchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should return the authenticated user", async () => {
    const { data } = await client.get<WhoAmIDTO>("/v1/whoami");
    expect(data.id).toBe(expectedUserId);
    expect(data.displayName).toBe("WhoAmITestUser");
  });
});
