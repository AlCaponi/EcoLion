import { describe, it, expect, beforeAll } from "vitest";
import type { ApiClient } from "../client/api-client.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { FriendSchema } from "../contracts/schemas.ts";
import type { FriendDTO } from "../contracts/types.ts";

describe("Friends API", () => {
  let client: ApiClient;

  beforeAll(async () => {
    const ctx = await createTestContext("FriendsTestUser");
    client = ctx.client;
  });

  describe("GET /v1/friends", () => {
    it("should return 200 with an array", async () => {
      const { status, data } = await client.get<FriendDTO[]>("/v1/friends");

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it("should have valid schema for each friend", async () => {
      const { data } = await client.get<FriendDTO[]>("/v1/friends");

      for (const friend of data) {
        const result = FriendSchema.safeParse(friend);
        if (!result.success) {
          console.error(
            `Schema error for friend ${friend.id}:`,
            result.error.issues,
          );
        }
        expect(result.success).toBe(true);
      }
    });

    it("should have unique friend IDs", async () => {
      const { data } = await client.get<FriendDTO[]>("/v1/friends");
      const ids = data.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("POST /v1/friends/:friendId/poke", () => {
    it("should successfully poke a friend", async () => {
      const { data: friends } = await client.get<FriendDTO[]>("/v1/friends");
      if (friends.length === 0) return; // skip if no friends

      const { status } = await client.post(
        `/v1/friends/${friends[0]!.id}/poke`,
      );
      expect(status).toBe(200);
    });

    it("should return 404 for a non-existent friend", async () => {
      const { status } = await client.post(
        "/v1/friends/nonexistent-friend-xyz/poke",
      );
      expect(status).toBe(404);
    });
  });
});
