import { describe, it, expect, beforeAll } from "vitest";
import { createApiClient, type ApiClient } from "../client/api-client.ts";
import { registerAnonymousUser } from "../client/auth.ts";
import { createTestContext } from "../helpers/test-context.ts";
import {
  AddFriendResponseSchema,
  FriendSummarySchema,
} from "../contracts/schemas.ts";
import type {
  AddFriendResponseDTO,
  UserSummaryDTO,
} from "../contracts/types.ts";

const API_BASE_URL = process.env["API_BASE_URL"] ?? "http://localhost:8080";

describe("Friends", () => {
  let client: ApiClient;
  let friendNames: string[] = [];
  let friendIds: string[] = [];

  beforeAll(async () => {
    const ctx = await createTestContext("Luca");
    client = ctx.client;

    const uniqueSuffix = `-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const friendOneName = `Mia${uniqueSuffix}`;
    const friendTwoName = `Jonas${uniqueSuffix}`;

    const friendOneClient = createApiClient({ baseUrl: API_BASE_URL });
    const friendTwoClient = createApiClient({ baseUrl: API_BASE_URL });

    const friendOne = await registerAnonymousUser(friendOneClient, friendOneName);
    const friendTwo = await registerAnonymousUser(friendTwoClient, friendTwoName);

    friendNames = [friendOneName, friendTwoName];
    friendIds = [friendOne.userId, friendTwo.userId];

    for (const friendId of friendIds) {
      const { data } = await client.post<AddFriendResponseDTO>("/v1/friends", {
        userId: friendId,
      });
      const result = AddFriendResponseSchema.safeParse(data);
      if (!result.success) {
        console.error("Add friend response schema errors:", result.error.issues);
      }
      expect(result.success).toBe(true);
    }
  });

  it("should list added friends", async () => {
    const { data } = await client.get<UserSummaryDTO[]>("/v1/friends");
    expect(Array.isArray(data)).toBe(true);

    const parseResults = data.map((friend) => FriendSummarySchema.safeParse(friend));
    const invalid = parseResults.find((result) => !result.success);
    if (invalid && !invalid.success) {
      console.error("Friend list schema errors:", invalid.error.issues);
    }
    expect(parseResults.every((result) => result.success)).toBe(true);

    const names = data.map((friend) => friend.displayName).sort();
    for (const name of friendNames) {
      expect(names).toContain(name);
    }
  });
});
