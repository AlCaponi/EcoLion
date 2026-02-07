// ---------------------------------------------------------------------------
// Contract types – copied from eco-loewe-pwa/src/shared/api/types.ts
//
// This IS the contract. If this file differs from the frontend types,
// that's a bug that needs resolution.
// ---------------------------------------------------------------------------

export type MobilityMode = "walk" | "pt" | "car";

export interface UserDTO {
  sustainabilityScore: number;
  streakDays: number;
  today: { walkKm: number; ptTrips: number; carKm: number };
  lion: {
    mood: "sad" | "neutral" | "happy";
    activityMode: "sleeping" | "idle" | "walking" | "riding";
    accessories: string[]; // equipped item IDs, e.g. ["hat-cap", "acc-sunglasses"]
    coins: number;
  };
}

export interface AssetDTO {
  id: string;
  url: string; // e.g. "/assets/shop/hat-cap.png"
  category: "glasses" | "hats" | "scarfs" | "earrings" | "outfits" | "decor";
}

export interface LeaderboardDTO {
  streakDays: number;
  quartiers: Array<{
    id: string;
    name: string;
    co2SavedKg: number;
    rank: number;
  }>;
  friends: Array<{
    id: string;
    name: string;
    co2SavedKg: number;
    streakDays: number;
  }>;
}

export interface ShopItemDTO {
  id: string;
  name: string;
  priceCoins: number;
  category: "hats" | "outfits" | "accessories" | "decor";
  owned: boolean;
  assetPath: string;
}

export interface PurchaseDTO {
  itemId: string;
}

export interface FriendDTO {
  id: string;
  name: string;
  streakDays: number;
  co2SavedKg: number;
}
