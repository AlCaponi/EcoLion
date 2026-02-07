import { z } from "zod";

export const DashboardSchema = z.object({
  sustainabilityScore: z.number().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  today: z.object({
    walkKm: z.number().nonnegative(),
    ptTrips: z.number().int().nonnegative(),
    carKm: z.number().nonnegative(),
  }),
  lion: z.object({
    mood: z.enum(["sad", "neutral", "happy"]),
    activityMode: z.enum(["sleeping", "idle", "walking", "riding"]),
    accessories: z.array(z.string()),
    coins: z.number().int().nonnegative(),
  }),
});

export const AssetSchema = z.object({
  id: z.string().min(1),
  url: z.string().startsWith("/"),
  category: z.enum(["glasses", "hats", "scarfs", "earrings", "outfits", "decor"]),
});

export const LeaderboardSchema = z.object({
  streakDays: z.number().int().nonnegative(),
  quartiers: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      co2SavedKg: z.number().nonnegative(),
      rank: z.number().int().positive(),
    }),
  ),
  friends: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      co2SavedKg: z.number().nonnegative(),
      streakDays: z.number().int().nonnegative(),
    }),
  ),
});

export const ShopItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  priceCoins: z.number().int().positive(),
  category: z.enum(["hats", "outfits", "accessories", "decor"]),
  owned: z.boolean(),
  assetPath: z.string().startsWith("/"),
});

export const FriendSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  streakDays: z.number().int().nonnegative(),
  co2SavedKg: z.number().nonnegative(),
});
