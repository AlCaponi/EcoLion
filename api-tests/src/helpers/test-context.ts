import { createApiClient, type ApiClient } from "../client/api-client.ts";
import { registerAnonymousUser } from "../client/auth.ts";

const API_BASE_URL = process.env["API_BASE_URL"] ?? "http://localhost:8080";

/**
 * Create an authenticated test context.
 * Registers a new anonymous user and returns the client with auth token set.
 *
 * Usage in tests:
 *   let client: ApiClient;
 *   beforeAll(async () => {
 *     const ctx = await createTestContext("MyTestUser");
 *     client = ctx.client;
 *   });
 */
export async function createTestContext(displayName?: string): Promise<{
  client: ApiClient;
  userId: string;
  token: string;
}> {
  const client = createApiClient({ baseUrl: API_BASE_URL });
  const { userId, token } = await registerAnonymousUser(client, displayName);
  return { client, userId, token };
}

/**
 * Create an unauthenticated client for testing 401 responses.
 */
export function createAnonymousClient(): ApiClient {
  return createApiClient({ baseUrl: API_BASE_URL });
}
