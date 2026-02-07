import { describe, it, expect, beforeAll } from "vitest";
import { createApiClient, type ApiClient } from "../client/api-client.ts";
import { registerAnonymousUser } from "../client/auth.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { UserListEntrySchema } from "../contracts/schemas.ts";
import type { UserListEntryDTO } from "../contracts/types.ts";

const API_BASE_URL = process.env["API_BASE_URL"] ?? "http://localhost:8080";

describe("Users API", () => {
  let client: ApiClient;
  let userOneId: string;
  let userTwoId: string;

  beforeAll(async () => {
    const ctx = await createTestContext("UsersTestUser");
    client = ctx.client;

    const userOneClient = createApiClient({ baseUrl: API_BASE_URL });
    const userTwoClient = createApiClient({ baseUrl: API_BASE_URL });

    ({ userId: userOneId } = await registerAnonymousUser(
      userOneClient,
      "UsersListOne",
    ));
    ({ userId: userTwoId } = await registerAnonymousUser(
      userTwoClient,
      "UsersListTwo",
    ));
  });

  describe("GET /v1/users", () => {
    it("should return 200 with an array", async () => {
      const { status, data } = await client.get<UserListEntryDTO[]>("/v1/users");

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it("should have valid schema for each user", async () => {
      const { data } = await client.get<UserListEntryDTO[]>("/v1/users");

      for (const user of data) {
        const result = UserListEntrySchema.safeParse(user);
        if (!result.success) {
          console.error(
            `Schema error for user ${user.id}:`,
            result.error.issues,
          );
        }
        expect(result.success).toBe(true);
      }
    });

    it("should have unique user IDs", async () => {
      const { data } = await client.get<UserListEntryDTO[]>("/v1/users");
      const ids = data.map((u) => u.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should include newly created users", async () => {
      const { data } = await client.get<UserListEntryDTO[]>("/v1/users");
      const ids = new Set(data.map((u) => u.id));
      expect(ids.has(userOneId)).toBe(true);
      expect(ids.has(userTwoId)).toBe(true);
    });
  });

  describe("POST /v1/users/:userId/poke", () => {
    it("should successfully poke a user", async () => {
      const { data: users } = await client.get<UserListEntryDTO[]>("/v1/users");
      if (users.length === 0) return; // skip if no users

      const { status } = await client.post(
        `/v1/users/${users[0]!.id}/poke`,
      );
      expect(status).toBe(200);
    });

    it("should return 404 for a non-existent user", async () => {
      const { status } = await client.post(
        "/v1/users/nonexistent-user-xyz/poke",
      );
      expect(status).toBe(404);
    });
  });
});
