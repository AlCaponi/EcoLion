import type { ApiClient } from "../client/api-client.ts";
import * as fixtures from "../fixtures/index.ts";

/**
 * Seed the backend with fixture data.
 *
 * Strategy A (preferred): The backend exposes POST /v1/admin/seed
 * that accepts bulk fixture data (only available in dev mode).
 *
 * Strategy B (fallback): Seed through individual POST endpoints
 * if the bulk endpoint is not available.
 */
export async function seedDatabase(client: ApiClient): Promise<void> {
  // Try bulk seed endpoint first
  const { status } = await client.post("/v1/admin/seed", {
    shopItems: fixtures.shopItems,
    friends: fixtures.friends,
    dashboard: fixtures.dashboard,
    leaderboard: fixtures.leaderboard,
  });

  if (status >= 200 && status < 300) {
    return;
  }

  // Fallback: seed through normal endpoints if available
  console.log(
    `Bulk seed returned ${status}; individual seeding not yet implemented.`,
  );
}

/**
 * Reset the backend database to a clean state.
 */
export async function cleanDatabase(client: ApiClient): Promise<void> {
  const { status } = await client.post("/v1/admin/reset");

  if (status < 200 || status >= 300) {
    console.log(
      `Database reset returned ${status}; endpoint may not be available yet.`,
    );
  }
}
