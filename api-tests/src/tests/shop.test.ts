import { describe, it, expect, beforeAll } from "vitest";
import type { ApiClient } from "../client/api-client.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { ShopItemSchema } from "../contracts/schemas.ts";
import type { ShopItemDTO } from "../contracts/types.ts";

describe("Shop API", () => {
  let client: ApiClient;

  beforeAll(async () => {
    const ctx = await createTestContext("ShopTestUser");
    client = ctx.client;
  });

  describe("GET /v1/shop/items", () => {
    it("should return 200 with an array", async () => {
      const { status, data } =
        await client.get<ShopItemDTO[]>("/v1/shop/items");

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it("should have valid schema for each item", async () => {
      const { data } = await client.get<ShopItemDTO[]>("/v1/shop/items");

      for (const item of data) {
        const result = ShopItemSchema.safeParse(item);
        if (!result.success) {
          console.error(
            `Schema error for item ${item.id}:`,
            result.error.issues,
          );
        }
        expect(result.success).toBe(true);
      }
    });

    it("should have unique item IDs", async () => {
      const { data } = await client.get<ShopItemDTO[]>("/v1/shop/items");
      const ids = data.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should only contain valid categories", async () => {
      const { data } = await client.get<ShopItemDTO[]>("/v1/shop/items");
      const validCategories = ["hats", "outfits", "accessories", "decor"];

      for (const item of data) {
        expect(validCategories).toContain(item.category);
      }
    });
  });

  describe("POST /v1/shop/purchase", () => {
    it("should successfully purchase an available item", async () => {
      const { data: items } =
        await client.get<ShopItemDTO[]>("/v1/shop/items");
      const available = items.find((i) => !i.owned);
      if (!available) return; // skip if nothing available

      const { status } = await client.post("/v1/shop/purchase", {
        itemId: available.id,
      });
      expect(status).toBe(200);
    });

    it("should return 404 for a non-existent item", async () => {
      const { status } = await client.post("/v1/shop/purchase", {
        itemId: "nonexistent-item-xyz",
      });
      expect(status).toBe(404);
    });

    it("should return 400 when itemId is missing", async () => {
      const { status } = await client.post("/v1/shop/purchase", {});
      expect(status).toBe(400);
    });
  });
});
