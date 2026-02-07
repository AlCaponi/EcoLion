import { describe, it, expect, beforeAll } from "vitest";
import type { ApiClient } from "../client/api-client.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { AssetSchema } from "../contracts/schemas.ts";
import type { AssetDTO } from "../contracts/types.ts";

describe("Assets API", () => {
  let client: ApiClient;

  beforeAll(async () => {
    const ctx = await createTestContext("AssetsTestUser");
    client = ctx.client;
  });

  describe("GET /v1/assets/:id", () => {
    it("should return 200 with a valid AssetDTO", async () => {
      const { status, data } = await client.get<AssetDTO>(
        "/v1/assets/hat-cap",
      );

      expect(status).toBe(200);
      const result = AssetSchema.safeParse(data);
      if (!result.success) {
        console.error("Schema validation errors:", result.error.issues);
      }
      expect(result.success).toBe(true);
    });

    it("should return the correct asset ID", async () => {
      const { data } = await client.get<AssetDTO>("/v1/assets/hat-cap");
      expect(data.id).toBe("hat-cap");
    });

    it("should return 404 for a non-existent asset", async () => {
      const { status } = await client.get("/v1/assets/nonexistent-xyz");
      expect(status).toBe(404);
    });
  });

  describe("GET /v1/assets?ids=...", () => {
    it("should return an array of AssetDTOs for multiple IDs", async () => {
      const { status, data } = await client.get<AssetDTO[]>(
        "/v1/assets?ids=hat-cap,acc-sunglasses",
      );

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);

      for (const asset of data) {
        const result = AssetSchema.safeParse(asset);
        if (!result.success) {
          console.error(
            `Schema error for asset ${asset.id}:`,
            result.error.issues,
          );
        }
        expect(result.success).toBe(true);
      }
    });

    it("should only contain valid categories", async () => {
      const { data } = await client.get<AssetDTO[]>(
        "/v1/assets?ids=hat-cap,acc-sunglasses",
      );
      const validCategories = [
        "glasses",
        "hats",
        "scarfs",
        "earrings",
        "outfits",
        "decor",
      ];

      for (const asset of data) {
        expect(validCategories).toContain(asset.category);
      }
    });

    it("should return an empty array for no matching IDs", async () => {
      const { status, data } = await client.get<AssetDTO[]>(
        "/v1/assets?ids=nonexistent-a,nonexistent-b",
      );

      expect(status).toBe(200);
      expect(data).toEqual([]);
    });
  });
});
